curl -X PUT \
  http://localhost:3001/composite/addresses/wake \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
            "url": "https://services.arcgis.com/bkrWlSKcjUDFDtgw/arcgis/rest/services/WAKE_COUNTY_WITH_FLDS/FeatureServer/0/query",
            "fieldMap": {
                "state": "STATE",
                "county": "COUNTY_NAME",
                "incorporatedmunicipality": "PO_NAME",
                "unincorpcounty": "COMMUNITY",
                "postalcommunityname": "PO_NAME",
                "zipcode": "ZIPCODE",
                "streetname": "ADDR_SN",
                "addressnumber": "ADDR_num",
                "guid": "ENTRY_ID",
                "addresstype": "RES_TYPE",
                "addressplacement": "ADDR_PLCM",
                "addresssource": "ADDR_SOURCE",
                "addressauthority": "ADDR_AUT",
                "dateLastupdated": "EDIT_DATE"
            },
            "extent": {
                "xmin": -8791772.385392163,
                "ymin": 4234781.366666152,
                "xmax": -8711144.406182202,
                "ymax": 4311130.199341895,
                "spatialReference": {
                    "wkid": 102100,
                    "latestWkid": 3857
                }
            }
        }'