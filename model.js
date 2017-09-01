/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/
const request = require('request').defaults({gzip: true, json: true})
const async = require('async')
const _ = require('lodash')
const FeatureService = require('featureservice')
const baseGeoJSON = require('./base-geojson')

function Model (koop) {}

Model.prototype.getData = (req, callback)=>{
  this.cache.retrieve(req.params.id, {}, (e, schema) => {
    if (e) return callback(e)
    buildQueries(schema.features.schemas, req.query, (err, data) => {
      if (err) return callback(err)
        async.map(data,
          (r, cb) => {
            // result features are back, need another field swizzle
            request(r.url, (err, res, qryResults) => {
              if (err || !qryResults.features || qryResults.features.length === 0) {
                return callback(err, `Query failed : ${r.url}`, res)
              }
              cb(null, translateFields(qryResults, r))
            })
          },
          (err, results) => {
            if (err) return callback(err)
            // everything is done, combine the results and send it along
            // const aggResults = results.length > 1 ? geomerge.merge(results) : results[0]
            // Should this be hard coded? I'm thinking this should be inserted through the putDataset
            var agg = baseGeoJSON
            const combinedFeatures = results.reduce((pre, curr) => {
              return pre.concat(curr)
            }, [])
            agg.filterApplied = {
              geometry: true,
              where: true
            }
            agg.features = combinedFeatures
            callback(null, agg)
          }
        )
      })
    })
}

Model.prototype.getDatasetSchema = (req, res, callback) => {
  this.cache.retrieve(req.params.id, {}, (e, data) => {
    if (e) return callback(e, `unable to find intitiative ${req.params.id}`, res)
    callback(null, data.features.schemas[req.params.schema], res)
  })
}

Model.prototype.putDatasetSchema = (req, res, callback) => {
  this.cache.retrieve(req.params.id, {}, (e, data) => {
    if (e) return callback(e, `unable to find intitiative ${req.params.id}`, res)

    // retrieve adds geojson schema by default, is this appropriate?
    data.schemas = data.schema || {}
    data.schemas[req.params.schema] = req.body

    this.cache.upsert(req.params.id, data, {}, e => {
      if (e) return callback(e, 'unable to add schema definition', res)
      var d = data.features.schemas[req.params.schema]
      callback(e, d, res)
    })
  })
}

Model.prototype.removeDatasetSchema = (req, res, callback) => {
  this.cache.retrieve(req.params.id, {}, (e, data) => {
    if (e) return callback(e, `unable to find intiative : ${req.params.id}`, res)
    delete data.features.schemas[req.params.schema]
    this.cache.upsert(req.params.id, data, {}, e => {
      if (e) callback(e, `unable to add schema definition : ${req.params.schema}`, res)
      callback(e, `${req.params.schema} sucessfully removed`, res)
    })
  })
}

Model.prototype.getDataset = (req, res, callback) => {
  this.cache.retrieve(req.params.id, {}, (e, data) => {
    callback(e, data, res)
  })
}

Model.prototype.putDataset = (req, res, callback) => {
  // put the initiative schema map into a cache
  //
  // validate these before inserting?
  this.cache.insert(req.params.id, req.body, {ttl: 5}, (e) => {
    return callback(null, req.body, res)
  })
}

Model.prototype.removeDataset = (req, res, callback) => {
  this.cache.delete(req.params.id, err => {
    if (err) return callback(err, `unable to find ${req.params.id}, nothing to delete`, res)
    callback(null, `${req.params.id} successfully removed`, res)
  })
}

function buildQueries (schema, query, qcb) {
  // for each schema
  const urls = Object.keys(schema).map(k => {
    const srvcSchema = schema[k]
    const base = srvcSchema.url
    const fldMap = srvcSchema.fieldMap
    const swizzledQuery = _.cloneDeep(query)
    swizzledQuery.where = translateQuery(fldMap, query.where)
    // Handle services in different reference systems *****
    swizzledQuery.outSR = 4326
    // ***** TODO: Shouldn't need to do this?
    swizzledQuery.f = 'geojson' // only supported with services >= 10.4
    // *****
    const newQuery = getAsParams(swizzledQuery)

    const newURL = `${base}?${newQuery}`

    return {url: newURL, schema: fldMap}
  })

  qcb(null, urls)
  /* paging?
  async.map(urls, getFSUrls, (e,r)=>{
    qcb(null, r.reduce((p,c)=>{return p.concat(c)}))
  })
  */
}

function getFSUrls (i, cb) {
  const fs = new FeatureService(i.url, {where: i.where})
  fs.pages((e, pages) => {
    if (e) cb(e)

    cb(
      null,
      pages.map(p => {
        return {
          url: p.req,
          schema: i.schema
        }
      }))
  })
}

function getAsParams (queryObj) {
  let str = []
  for (var prop in queryObj) {
    if (queryObj.hasOwnProperty(prop)) {
      str.push(encodeURIComponent(prop) + '=' + encodeURIComponent(queryObj[prop]))
    }
  }
  return str.join('&')
}

function translateFields (ofResults, toSchema) {
  if (!ofResults.features || ofResults.features.length === 0) return null
  return ofResults.features.map(f => {
    let newProps = {}
    let att = f.attributes ? f.attributes : f.properties
    Object.keys(att).forEach(fAtt => {
      for (var prop in toSchema.schema) {
        if (fAtt === toSchema.schema[prop]) {
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

function translateQuery (fields, query) {
  // replace query fields with fields from the schema map
  let newQuery = query
  for (var f in fields) {
    newQuery = newQuery.replace(new RegExp(f, 'g'), fields[f])
  }
  return newQuery
}

module.exports = Model