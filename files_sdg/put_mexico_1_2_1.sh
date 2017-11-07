curl -X PUT \
  http://localhost:3001/composite/sdgpoverty/mex \
  -H 'content-type: application/json' \
  -d '{
      "url": "https://services8.arcgis.com/wvXNCrOBOObhsKqy/arcgis/rest/services/Inidicator_1_2_1_ok/FeatureServer/0/query",
      "fieldMap": {
        "obs_value": "y_2014",
        "entity_name": "Entidad"
    },
    "extent": {
      "xmin": -15805496.156624636,
      "ymin": -520039.4837769512,
      "xmax": -6344426.543601176,
      "ymax": 5350324.288523024,
      "spatialReference": {
        "wkid": 102100
      }
    }
}'
