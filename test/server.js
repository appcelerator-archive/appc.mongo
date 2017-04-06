'use strict'

const Arrow = require('arrow')

module.exports = function (options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    const arrow = new Arrow({}, true)
    const connector = arrow.getConnector('appc.mongo')
    connector.metadata = {}

    if (options.generateTestModels !== false) {
      // Create test model - Posts
      arrow.addModel(Arrow.createModel('Posts', {
        name: 'Posts',
        connector,
        fields: {
          title: {
            type: 'string',
            required: false
          },
          content: {
            type: 'string',
            required: false
          }
        },
        metadata: {
          primarykey: 'id'
        }
      }))
    }

    // Return the arrow instance
    resolve(arrow)
  })
}
