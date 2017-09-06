module.exports = {
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
      alias: 'guid',
      sqlType: 'sqlTypeNVarchar',
      'length': 256,
      'nullable': true,
      'editable': true,
      'domain': null,
      'defaultValue': null
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
    }]
  }
}
