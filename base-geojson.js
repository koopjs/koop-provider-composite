module.exports = {
  type: 'FeatureCollection',
  features: [],
  metadata: {
    maxRecordCount: 5000,
    geometryType: 'Point',
    extent: {
      xmin:-137.889404296875,
      ymin:11.55487060546875,
      xmax:-45.604248046875,
      ymax:57.34588623046875,
      spatialReference:{
        wkid:4326
      }
    },
    idField: "aid",
    name: 'Aggregrated Addresses',
    description: 'proxied by http://koopjs.github.io/',
    fields: [
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
      },
      {
        name: 'aid',
        type: 'esriFieldTypeDouble',
        alias: 'aid'
      }
    ]
  }
}