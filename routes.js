/*
  routes.js

  This file is an optional place to specify additional routes to be handled by this provider's controller
  Documentation: http://koopjs.github.io/docs/specs/provider/
*/
module.exports = [
  {
    path: '/composite/:id',
    methods: ['get', 'put', 'delete', 'post'],
    handler: 'dataset'
  },
  {
    path: '/composite/:id/:schema',
    methods: ['get', 'put', 'delete'],
    handler: 'datasetSchema'
  }
]
