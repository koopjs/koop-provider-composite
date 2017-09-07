module.exports = {
  type: 'FeatureCollection',
  features: [],
  metadata: {
    geometryType: 'Point',
    extent: {
      xmin: -119.70703125,
      ymin: 16.85302734375,
      xmax: -77.958984375,
      ymax: 59.34814453125,
      spatialReference: {
        wkid: 4326
      }
    },
    name: 'Aggregrated Addresses',
    description: 'proxied by http://koopjs.github.io/',
    fields: [{
        name: 'OBJECTID',
        type: 'esriFieldTypeOID',
        alias: 'OBJECTID'
      },
      {
        name: 'state',
        type: 'esriFieldTypeString',
        alias: 'state'
      },
      {
        name: 'county',
        type: 'esriFieldTypeString',
        alias: 'county'
      },
      {
        name: 'incorporatedmunicipality',
        type: 'esriFieldTypeString',
        alias: 'incorporatedMunicipality'
      },
      {
        name: 'unincorporatedmunicipality',
        type: 'esriFieldTypeString',
        alias: 'unincorporatedMunicipality'
      },
      {
        name: 'zipcode',
        type: 'esriFieldTypeString',
        alias: 'zipCode'
      },
      {
        name: 'streetname',
        type: 'esriFieldTypeString',
        alias: 'streetname'
      },
      {
        name: 'addressnumber',
        type: 'esriFieldTypeString',
        alias: 'addressNumber'
      },
      {
        name: 'guid',
        type: 'esriFieldTypeString',
        alias: 'guid'
      },
      {
        name: 'addresstype',
        type: 'esriFieldTypeString',
        alias: 'addressType'
      },
      {
        name: 'addressplacement',
        type: 'esriFieldTypeString',
        alias: 'addressPlacement'
      },
      {
        name: 'addresssource',
        type: 'esriFieldTypeString',
        alias: 'addressSource'
      },
      {
        name: 'addressauthority',
        type: 'esriFieldTypeString',
        alias: 'addressAuthority'
      },
      {
        name: 'datelastupdated',
        type: 'esriFieldTypeDate',
        alias: 'dateLastUpdated'
      },
      {
        name: 'sourceservice',
        type: 'esriFieldTypeString',
        alias: 'sourceService'
      }
    ]
  }
}