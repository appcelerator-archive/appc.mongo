exports.create = function create (Model, values, next) {
  var self = this
  var payload = Model.instance(values, false).toPayload()
  var collection = this.getCollection(Model)

  collection.insert(payload, function didInsert (err, results) {
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
