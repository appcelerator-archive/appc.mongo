var MongoDB = require('mongodb')
var ObjectID = MongoDB.ObjectID

exports.findByID = function findByID (Model, value, next) {
  var self = this
  var collection = this.getCollection(Model)
  var query

  /* istanbul ignore else */
  if (typeof value === 'string' || value instanceof ObjectID) {
    query = this.createPrimaryKeyQuery(value)
  }

  if (!query) {
    return next(new Error('Invalid Value for Find By ID: ' + value))
  }

  collection.findOne(query, {}, function (err, doc) {
    /* istanbul ignore if */
    if (err) {
      return next(err)
    }
    if (!doc) {
      return next()
    }
    var instance = self.createInstanceFromResult(Model, doc)
    next(null, instance)
  })
}
