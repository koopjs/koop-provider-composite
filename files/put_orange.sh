curl -X PUT \
  http://localhost:3001/composite/addresses/orange \
  -H 'content-type: application/json' \
  -d '{
      "url": "https://services7.arcgis.com/BBpPn9wZu2D6eTNY/arcgis/rest/services/ORANGE_COUNTY_WITH_FLDS/FeatureServer/0/query",
      "fieldMap": {
        "state": "State",
        "county": "Add_cnty",
        "incorporatedmunicipality": "MailingCit",
        "unincorpcounty": "Add_uninc",
        "postalcommunityname": "FireDist",
        "zipcode": "ZipCode",
        "streetname": "Name",
        "addressnumber": "HouseNum",
        "guid": "guid",
        "addresstype": "LBCSDesc",
        "addressplacement": "Add_plcmnt",
        "addresssource": "Add_src",
        "addressauthority": "Add_auth",
        "datelastupdated": "EditDate"
    },
    "extent": {
        "xmin": -8825271.4547,
        "ymin": 4280522.407899998,
        "xmax": -8788727.2223,
        "ymax": 4334516.740699999,
        "spatialReference": {
            "wkid": 102100,
            "latestWkid": 3857
        }
    }
}'