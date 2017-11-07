curl -X PUT \
  http://localhost:3001/composite/sdgpoverty/ \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "name": "SDG Intitiative - Poverty Testing",
  "description": "Poverty Intitiative Testing",
  "indicator_schema": {
    "type": "FeatureCollection",
    "features": [],
    "metadata": {
      "maxRecordCount": 5000,
      "geometryType": "Polygon",
      "extent": {
        "xmin": -15805496.156624636,
        "ymin": -520039.4837769512,
        "xmax": -6344426.543601176,
        "ymax": 5350324.288523024,
        "spatialReference": {
          "wkid": 102100
        }
      },
      "idField": "aid",
      "name": "Poverty Aggregation",
      "description": "proxied by http://koopjs.github.io/",
      "fields": [{
        "name": "obs_value",
        "type": "esriFieldTypeDouble",
        "alias": "Observed Value"
        }, {
          "name": "entity_name",
          "type": "esriFieldTypeString",
          "alias": "Entity Name"
        }, {
          "name": "aid",
          "type": "esriFieldTypeDouble",
          "alias": "aid"
        }
      ]
    },
    "aggregate_schemas": {}
  },
  "aggregate_schemas": {}
}'
