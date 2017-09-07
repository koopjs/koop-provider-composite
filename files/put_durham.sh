curl -X PUT \
  http://localhost:3001/composite/addresses/durham \
  -H 'content-type: application/json' \
  -d '{
      "url": "https://services.arcgis.com/hRUr1F8lE8Jq2uJo/arcgis/rest/services/DURHAM_COUNTY_WITH_FLDS/FeatureServer/0/query",
      "fieldMap": {
        "state": "State",
        "county": "County",
        "incorporatedmunicipality": "CITY2",
        "unincorpcounty": "UNINCORP",
        "postalcommunityname": "SUBDIVISIO",
        "zipcode": "ZIPCODE",
        "streetname": "STREETNAME",
        "addressnumber": "HOUSENUM",
        "guid": "guid_str",
        "addresstype": "TYPE",
        "addressplacement": "PLACEMENT",
        "addresssource": "SOURCE",
        "addressauthority": "AUTHORITY",
        "datelastupdated": "UPDATED_DT"
    }
}'