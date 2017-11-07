/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/
const request = require('request-promise').defaults({
  gzip: true,
  json: true
})

const _ = require('lodash')
const FeatureService = require('featureservice')
const baseGeoJSON = require('./base-geojson')
const terraformer = require('terraformer')

/**
 *
 * @param {*} koop
 */
function Model(koop) {
  //this.indicator = {}

  this.getData = function (req, callback) {
    this.cache.catalog.retrieve(req.params.id, function (e, schema) {
      if (e) return callback(e)
      if (schema.indicator_schema.metadata) {
        baseGeoJSON.metadata = schema.indicator_schema.metadata
      }
      buildQueries(schema.aggregate_schemas, req.query, function (err, data) {
        if (err) return callback(err)

        Promise.all(
          data.map(function (d) {
            // console.log(JSON.stringify(d));
            return request({
              uri: d.url,
              schema: d,
              transform: function (b) {
                return translateFields(b, this.schema)
              }
            })
        })).then(function (results) {
            // everything is done, combine the results and send it along
            if (results[0] && results[0].count) {
              var c = {}
              c.count = results.reduce(function (pVal, cVal) {
                return pVal + cVal.count
               }, 0)
               return callback(null, c)
            }

            var agg = baseGeoJSON
            const combinedFeatures = results.reduce(function (pre, curr) {
              if (curr) return pre.concat(curr)
              return pre
            }, [])
            agg.filtersApplied = {
              geometry: true,
              where: true,
              offset: true,
              projection: true
            }
            agg.features = combinedFeatures || []

            return callback(null, agg)
          })
          .catch(function (err) {
            return callback(err);
          })
      })
    })
  }

  var counter = 0;

  this.getDatasetSchema = function (req, res, callback) {
    this.cache.catalog.retrieve(req.params.id, function (e, data) {
      if (e) return callback(e, `unable to find intitiative ${req.params.id}`, res)
      return callback(null, data.aggregate_schemas[req.params.schema], res)
    })
  }

  this.putDatasetSchema = function (req, res, callback) {
    const rCache = this.cache
    rCache.catalog.retrieve(req.params.id, function (e, data) {
      if (e) return callback(e, `unable to find intitiative ${req.params.id}`, res)

      // retrieve adds geojson schema by default, is this appropriate?
      data.aggregate_schemas = data.aggregate_schemas || {}
      data.aggregate_schemas[req.params.schema] = req.body
      // TODO - Update Indicator Extent, after inserting a new agg service

      rCache.catalog.update(req.params.id, data, function (err) {
        if (err) return callback(err, 'unable to add schema definition', res)
        var d = data.aggregate_schemas[req.params.schema]
        callback(e, d, res)
      })
    })
  }

  this.removeDatasetSchema = function (req, res, callback) {
    const rCache = this.cache
    rCache.catalog.retrieve(req.params.id, function (e, data) {
      if (e) return callback(e, `unable to find intiative : ${req.params.id}`, res)
      delete data.aggregate_schemas[req.params.schema]
      rCache.catalog.update(req.params.id, data, function (err) {
        if (err) callback(err, `unable to remove schema definition : ${req.params.schema}`, res)
        return callback(null, `${req.params.schema} sucessfully removed`, res)
      })
    })
  }

  this.getDataset = function (req, res, callback) {
    this.cache.catalog.retrieve(req.params.id, function (err, data) {
      if (err) return callback(err, `Unable to get ${req.params.id}`, res)
      callback(null, data, res)
    })
  }

  this.putDataset = function (req, res, callback) {
    // put the initiative schema map into a cache
    //
    // validate these before inserting?
    this.cache.catalog.insert(req.params.id, req.body, function (e) {
      if (e) return callback(e, 'unable to put initiative', res)
      return callback(null, req.body, res)
    })
  }

  /**
   *
   */
  this.removeDataset = function (req, res, callback) {
    this.cache.catalog.delete(req.params.id, function (err) {
      if (err) return callback(err, `unable to find ${req.params.id}, nothing to delete`, res)
      callback(null, `${req.params.id} successfully removed`, res)
    })
  }
}

/**
 *
 * @param {*} schema
 * @param {*} query
 * @param {*} qcb
 */
function buildQueries(schema, query, qcb) {

  // for each schema
  const urls = Object.keys(schema)
    .filter(function (itm) {
      return isValidExtent(schema[itm], query);
    })
    .map(
      function (k) {
        const srvcSchema = schema[k]
        const base = srvcSchema.url
        const fldMap = srvcSchema.fieldMap
        const swizzledQuery = _.cloneDeep(query)
        var  tQuery = translateQuery(fldMap, query.where)
        if (tQuery) swizzledQuery.where = tQuery

        // ***** TODO: questions?
        // Handle services in different reference systems *****
        // if (swizzledQuery.outSR !== 4326){
        //   swizzledQuery.outSR = 4326
        // }

        // only supported with services >= 10.4
        if (swizzledQuery.f !== 'geojson') {
          swizzledQuery.f = 'geojson'
        }
        // *****

        const newQuery = getAsParams(swizzledQuery)
        const newURL = `${base}?${newQuery}`

        return {
          url: newURL,
          schema: srvcSchema,
          q: swizzledQuery
        }
      }
    )

  qcb(null, urls)
  /* paging?
  async.map(urls, getFSUrls, (e,r)=>{
    qcb(null, r.reduce((p,c)=>{return p.concat(c)}))
  })
  */
}

/**
 * only send queries if they fall in our aoi
 * @param {*extent of query} geometry sent in query extent
 * @param {*extent of schema} Extent of baseSchema to compare against
 */
function isValidExtent (schema, query) {

  if (schema.extent && query.geometry) {
    var sJSON = {
      "type": "Polygon",
      "coordinates": [[
        [schema.extent.xmin, schema.extent.ymin],
        [schema.extent.xmax, schema.extent.ymin],
        [schema.extent.xmax, schema.extent.ymax],
        [schema.extent.xmin, schema.extent.ymax]
      ]]
    }
    terraformer.Tools.toGeographic(sJSON)

    var sPoly = new terraformer.Primitive(sJSON);
    sPoly.close();

    //
    var qj = JSON.parse(query.geometry)
    var qJSON = {
      "type": "Polygon",
      "coordinates": [[
          [qj.xmin, qj.ymin],
          [qj.xmax, qj.ymin],
          [qj.xmax, qj.ymax],
          [qj.xmin, qj.ymax]
      ]]
    }

    terraformer.Tools.toGeographic(qJSON)
    var qPoly = new terraformer.Primitive(qJSON)
    qPoly.close()
    var i = qPoly.intersects(sPoly);
    return i
  }

  // schema or query doesn't have a specified boundary
  // let it through
  return true;
}

/**
 *
 * @param {*} itm
 */
function requestASync(itm) {
  return new Promise(function (resolve, reject) {
    request(itm.url, function (err, res, body) {
      if (err) return reject(err)
      if (itm.q.returnCountOnly || itm.q.returnIdsOnly) {
        return resolve(body.properties)
      }
      const features = translateFields(body, itm)
      return resolve(features)
    })
  })
}

/**
 *
 * @param {*} i
 * @param {*} cb
 */
function getFSUrls(i, cb) {
  const fs = new FeatureService(i.url, {
    where: i.where
  })
  fs.pages(function (e, pages) {
    if (e) cb(e)

    cb(
      null,
      pages.map(function (p) {
        return {
          url: p.req,
          schema: i.schema
        }
      }))
  })
}

function getIndicator(results) {
  console.log('Get Results')
}

/**
 *
 * @param {*} queryObj
 */
function getAsParams(queryObj) {
  let str = []
  const xParams = ['callback', 'outStatistics']
  for (var i = 0, keys = Object.keys(queryObj); i < keys.length; i++) {
    var prop = keys[i]
    if (!xParams.includes(prop)) {
      str.push(encodeURIComponent(prop) + '=' + encodeURIComponent(queryObj[prop]))
    }
  }
  return str.join('&')
}

/**
 *
 * @param {*} ofResults
 * @param {*} toSchema
 */
function translateFields(ofResults, toSchema) {
  if (!ofResults.features || ofResults.features.length === 0) return null
  return ofResults.features.map(function (f) {
    let newProps = {}
    let att = f.attributes ? f.attributes : f.properties
    const prefixID = toSchema.schema.oidPreFix || (Date.now() * (Math.random() * 30000))
    Object.keys(att).forEach(function (fAtt) {
      for (var prop in toSchema.schema.fieldMap) {
        if (fAtt === toSchema.schema.fieldMap[prop]) {
          newProps[prop] = att[fAtt]
        }
      }
    })
    // try and pseudo randomize an objectid
    newProps.aid = parseInt(`${prefixID}${f.id}`,10)
    newProps.sourceservice = toSchema.url.split('?')[0]
    return {
      properties: newProps,
      geometry: f.geometry
    }
  })
}

/**
 *
 * @param {*} fields
 * @param {*} query
 */
function translateQuery(fields, query) {
  // replace query fields with fields from the schema map
  if (!query) return
  let newQuery = query
  for (var f in fields) {
    newQuery = newQuery.replace(new RegExp(f, 'g'), fields[f])
  }
  return newQuery
}

module.exports = Model
