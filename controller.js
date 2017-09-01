/*
  controller.js

  This file is not required unless additional routes specified in routes.js
  If so, corresponding functions must be written to match those routes.

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/

module.exports = function (model) {
  this.model = model

  this.dataset = (req, res) => {
    switch (req.method) {
      case 'GET':
        return this.model.getDataset(req, res, handleResponse)
      case 'PUT':
        return this.model.putDataset(req, res, handleResponse)
      case 'DELETE':
        return this.model.removeDataset(req, res, handleResponse)
    }
  }

  this.datasetSchema = (req, res) => {
    switch (req.method) {
      case 'GET':
        return this.model.getDatasetSchema(req, res, handleResponse)
      case 'PUT':
        return this.model.putDatasetSchema(req, res, handleResponse)
      case 'DELETE':
        return this.model.removeDatasetSchema(req, res, handleResponse)
    }
  }
}

const handleResponse = (err, data, res) => {
  if (err) {
    return res.status(err.code || 500).json({error: err.message})
  } else {
    return res.status(200).json(data)
  }
}
