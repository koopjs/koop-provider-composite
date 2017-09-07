/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/
const request = require('request-promise').defaults({
  gzip: true,
  json: true
})
const async = require('async')
const _ = require('lodash')
const FeatureService = require('featureservice')
const baseGeoJSON = require('./base-geojson')
const baseCount = require('./base-returnCount')

console.log('wtf')

function Model(koop) {
  this.getData = function (req, callback) {
    //console.log('hello')
    this.cache.catalog.retrieve(req.params.id, function (e, schema) {
      //console.log(e, schema)
      if (e) return callback(e)
      buildQueries(schema.schemas, req.query, function (err, data) {
        //console.log(data)
        if (err) return callback(err)

        let fsRequests = []
        data.forEach(function (d, i) {
          fsRequests.push(requestASync(d))
        })
        Promise.all(fsRequests)
          .then(function (results) {
            // everything is done, combine the results and send it along
            if (results[0] && results[0].count) {
              var c = baseCount
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
            agg.filterApplied = {
              geometry: true,
              where: true
            }
            agg.features = combinedFeatures || []
            // console.log('Returning \n', agg)
            return callback(null, agg)
          })
          .catch(function (err) {
            console.log(`getData : ${err}`)
          })
      })
    })
  }

  this.getDatasetSchema = function (req, res, callback) {
    this.cache.catalog.retrieve(req.params.id, function (e, data) {
      if (e) return callback(e, `unable to find intitiative ${req.params.id}`, res)
      return callback(null, data.schemas[req.params.schema], res)
    })
  }

  this.putDatasetSchema = function (req, res, callback) {
    const rCache = this.cache
    rCache.catalog.retrieve(req.params.id, function (e, data) {
      if (e) return callback(e, `unable to find intitiative ${req.params.id}`, res)

      // retrieve adds geojson schema by default, is this appropriate?
      data.schemas = data.schema || {}
      data.schemas[req.params.schema] = req.body

      rCache.catalog.update(req.params.id, data, function (err) {
        if (err) return callback(err, 'unable to add schema definition', res)
        var d = data.schemas[req.params.schema]
        callback(e, d, res)
      })
    })
  }

  this.removeDatasetSchema = function (req, res, callback) {
    const rCache = this.cache
    rCache.catalog.retrieve(req.params.id, function (e, data) {
      if (e) return callback(e, `unable to find intiative : ${req.params.id}`, res)
      delete data.schemas[req.params.schema]
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
  const urls = Object.keys(schema).map(function (k) {
    const srvcSchema = schema[k]
    const base = srvcSchema.url
    const fldMap = srvcSchema.fieldMap
    const swizzledQuery = _.cloneDeep(query)
    var  tQuery = translateQuery(fldMap, query.where) 
    if (tQuery) swizzledQuery.where = tQuery
    
    // ***** TODO: questions?
    
    // Handle services in different reference systems *****
    if (swizzledQuery.outSR !== 4326){
      swizzledQuery.outSR = 4326
    }

    // only supported with services >= 10.4
    if (swizzledQuery.f !== 'geojson') {
      swizzledQuery.f = 'geojson'
    } 
    // *****
    const newQuery = getAsParams(swizzledQuery)

    const newURL = `${base}?${newQuery}`

    return {
      url: newURL,
      schema: fldMap,
      q: swizzledQuery
    }
  })

  qcb(null, urls)
  /* paging?
  async.map(urls, getFSUrls, (e,r)=>{
    qcb(null, r.reduce((p,c)=>{return p.concat(c)}))
  })
  */
}

/**
 * 
 * @param {*} itm 
 */
function requestASync(itm) {
  return new Promise(function (resolve, reject) {
    // console.log(`Requesting\n ${itm.url}`)
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

/**
 * 
 * @param {*} queryObj 
 */
function getAsParams(queryObj) {
  let str = []
  for (var prop in queryObj) {
    if (queryObj.hasOwnProperty(prop) & prop !== 'callback') {
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
    Object.keys(att).forEach(function (fAtt) {
      for (var prop in toSchema.schema) {
        if (fAtt === toSchema.schema[prop]) {
          // console.log(`Matched ${fAtt} to ${prop}`)
          newProps[prop] = att[fAtt]
        }
      }
    })
    newProps['sourceService'] = toSchema.url.split('?')[0]
    return {
      type: 'Feature',
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