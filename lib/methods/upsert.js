var MongoDB = require('mongodb')
var ObjectID = MongoDB.ObjectID

exports.upsert = function upsert (Model, id, document, next) {
  var self = this
  var collection = self.getCollection(Model)

  var query = { _id: id }
  if (typeof id === 'string' || id instanceof ObjectID) {
    query = self.createPrimaryKeyQuery(id)
    collection.findAndModify(query, {}, document, { upsert: true, new: true }, function (err, result) {
      /* istanbul ignore if */
      if (err) {
        return next(err)
      }
      next(null, self.createInstanceFromResult(Model, result.value))
    })
  } else if (!id) {
    collection.insert(document, function didInsert (err, results) {
      /* istanbul ignore if */
      if (err) {
        return next(err)
      }
      /* istanbul ignore if */
      if (!results.ops || !results.ops.length) {
        return next()
      }
      next(null, self.createInstanceFromResult(Model, results.ops[0]))
    })
  }
}
