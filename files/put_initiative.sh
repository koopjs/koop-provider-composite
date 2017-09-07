curl -X PUT \
  http://localhost:3001/composite/addresses/ \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{"name":"Intitiative","description":"Hey Now!","schemas": {}}'