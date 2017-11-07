curl -X PUT \
  http://localhost:3001/composite/sdg_poverty/phl \
  -H 'content-type: application/json' \
  -d '{
      "url": "https://services8.arcgis.com/4nQEMj8vd1ryiZdd/arcgis/rest/services/Poverty_in_the_Provinces/FeatureServer/0/query",
      "fieldMap": {
        "obs_value": "PI2015",
        "entity_name": "AREANAME"
    },
    "extent": {
      "xmin": 11058756.056363128,
      "ymin": -290116.9026952023,
      "xmax": 15789290.862874858,
      "ymax": 2645064.983454785,
      "spatialReference": {
        "wkid": 102100
      }
    }
}'
