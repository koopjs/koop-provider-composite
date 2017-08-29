/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/
const request = require('request').defaults({gzip: true, json: true})
const async = require('async')
const config = require('config')
const _ = require('lodash')
const featureservice = require('featureservice')

module.exports = function (koop) {
  this.getData = (req, callback) =>{
    this.cache.retrieve(req.params.id, {}, (e, schema) =>{
      if (e) return callback(e)
      buildQueries(schema.features.schemas, req.query, (err, data)=>{
        async.map(data, 
          (r, cb)=>{
            // result features are back, need another field swizzle
            request(r.url, (err, res, qryResults)=>{
              if (err || !qryResults.features || qryResults.features.length === 0) {
                callback(err)
                return
              }
                cb(null,  translateFields(qryResults, r))
            })
          }, 
          (err, results)=>{
            if (err) callback(err)
            // everything is done, combine the results and send it along
            //const aggResults = results.length > 1 ? geomerge.merge(results) : results[0]
            // Should this be hard coded? I'm thinking this should be inserted through the putDataset
            var agg = {
              type: 'Featurecollection',
              features: [],
              metadata: {
                  geometryType: 'Point',
                  extent: {
                      xmin: -77.17599999995176,
                      ymin: 38.75499999997567,
                      xmax: -76.89599999995201,
                      ymax: 39.034999999975405,
                      spatialReference: {
                          wkid: 4326,
                          latestWkid: 4326
                      }
                  },
                  name: 'Aggregrated Addresses',
                  description: 'proxied by http://koopjs.github.io/',
                  idField: 'OBJECTID',
                  fields: [{
                          name: "OBJECTID",
                          type: "esriFieldTypeOID",
                          alias: "OBJECTID",
                      },
                      {
                          name: "state",
                          type: "esriFieldTypeString",
                          alias: "state",
                      },
                      {
                          name: "county",
                          type: "esriFieldTypeString",
                          alias: "county",
                      },
                      {
                          name: "incorporatedmunicipality",
                          type: "esriFieldTypeString",
                          alias: "incorporatedMunicipality",
                      },
                      {
                          name: "unincorporatedmunicipality",
                          type: "esriFieldTypeString",
                          alias: "unincorporatedMunicipality",
                      },
                      {
                          name: "zipcode",
                          type: "esriFieldTypeString",
                          alias: "zipCode",
                      },
                      {
                          name: "streetname",
                          type: "esriFieldTypeString",
                          alias: "streetname",
                      },
                      {
                          name: "addressnumber",
                          type: "esriFieldTypeString",
                          alias: "addressNumber",
                      },
                      {
                          name: "guid",
                          type: "esriFieldTypeString",
                          alias: "guid",
                          sqlType: "sqlTypeNVarchar",
                          "length": 256,
                          "nullable": true,
                          "editable": true,
                          "domain": null,
                          "defaultValue": null
                      },
                      {
                          name: "addresstype",
                          type: "esriFieldTypeString",
                          alias: "addressType",
                      },
                      {
                          name: "addressplacement",
                          type: "esriFieldTypeString",
                          alias: "addressPlacement",
                      },
                      {
                          name: "addresssource",
                          type: "esriFieldTypeString",
                          alias: "addressSource",
                      },
                      {
                          name: "addressauthority",
                          type: "esriFieldTypeString",
                          alias: "addressAuthority",
                      },
                      {
                          name: "datelastupdated",
                          type: "esriFieldTypeDate",
                          alias: "dateLastUpdated",
                      }
                  ]
          
              },
              ttl: 5
            }
            const combinedFeatures = results.reduce((pre, curr)=> {
              return pre.concat(curr)
            })
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

  this.getDatasetSchema = (req, res, callback)=> {
    this.cache.retrieve(req.params.id, {}, (e, data) =>{
      if(e)return callback(e, `unable to find intitiative ${req.params.id}`, res)
      callback(null, data.features.schemas[req.params.schema], res)
    })
  }

  this.putDatasetSchema = (req, res, callback)=> {
    this.cache.retrieve(req.params.id, {}, (e, data) => {
      if (e) callback(e, `unable to find intitiative ${req.params.id}`, res)
        
      // retrieve adds geojson schema by default, is this appropriate?
      data.features.schemas[req.params.schema] = req.body
     
      this.cache.upsert(req.params.id , data, {}, e => {
        if (e) callback(e, 'unable to add schema definition', res)
      })

      var d = data.features.schemas[req.params.schema]
     callback(e, d, res)
    })
  }

  this.removeDatasetSchema = (req, res, callback)=>{
    this.cache.retrieve(req.params.id, {}, (e, data) => {
      if (e) callback(e, `unable to find intiative : ${req.params.id}`, res)
      delete data.features.schemas[req.params.schema]
      this.cache.upsert(req.params.id , data, {}, e => {
        if (e) callback(e, `unable to add schema definition : ${req.params.schema}`, res)
      })
      callback(e, `${req.params.schema} sucessfully removed`, res)
    })
  }

  this.getDataset = (req, res, callback)=> {
    this.cache.retrieve(req.params.id, {}, (e, data) =>{
      callback(e, data, res)
    })
  }

  this.putDataset = (req, res, callback)=> {
    // put the initiative schema map into a cache
    // 
    // validate these before inserting?
    this.cache.insert(req.params.id, req.body, {ttl:5})
    callback(null, req.body, res )
  }
  
  this.removeDataset = (req, res, callback)=> {
    this.cache.delete(req.params.id, err=>{
      if (err) callback(err, `unable to find ${req.params.id}, nothing to delete`, res)
    })
    callback(null, `${req.params.id} successfully removed`, res)
  }
}

buildQueries = (schema, query, qcb) => {
  // for each schema
  const urls = Object.keys(schema).map(k=>{
    const srvcSchema = schema[k]
    const base = srvcSchema.url
    const fldMap = srvcSchema.fieldMap
    const swizzledQuery = _.cloneDeep(query)
    swizzledQuery.where = translateQuery(fldMap, query.where)
    const newQuery = getAsParams(swizzledQuery)

    const newURL = `${base}?${newQuery}`
    
    return {url: newURL, schema: fldMap}
  })

  qcb(null, urls);
  /* paging?
  async.map(urls, getFSUrls, (e,r)=>{
    qcb(null, r.reduce((p,c)=>{return p.concat(c)}))
  })
  */
  
}

getFSUrls = (i, cb)=> {
  const fs = new featureservice(i.url, {where: i.where})
  fs.pages((e, pages)=>{
    if (e) cb(e)
    
    cb(
      null, 
      pages.map(p=>{
        return {
          url: p.req, 
          schema: i.schema
        }
      }))
  })
}

getAsParams = (queryObj)=>{
  let str = [];
  for (var prop in queryObj)
    if (queryObj.hasOwnProperty(prop)) {
      str.push(encodeURIComponent(prop) + "=" + encodeURIComponent(queryObj[prop]));
    }
  return str.join("&");
}

translateFields = (ofResults, toSchema)=>{
  if (!ofResults.features || ofResults.features.length === 0) return null
  const newFeatures = ofResults.features.map(f=>{
    let newProps = {}
    Object.keys(f.attributes).forEach(fAtt => {
      for (var prop in toSchema.schema) {
        if (fAtt === toSchema.schema[prop]){
          newProps[prop] = f.attributes[fAtt]
        }
      }
    })
    f.properties = newProps
    f.properties.sourceService = toSchema.url.split('?')[0]

    return f;
  })

  return newFeatures
}

translateQuery = (fields, query) => {
  // replace query fields with fields from the schema map
  let newQuery = query
  for (var f in fields) {
    newQuery = newQuery.replace(new RegExp(f, 'g'), fields[f]);
  }
  return newQuery
}
