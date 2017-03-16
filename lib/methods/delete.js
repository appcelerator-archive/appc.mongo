exports['delete'] = function deleteOne (Model, instance, next) {
  var collection = this.getCollection(Model)
  var query = this.createPrimaryKeyQuery(instance.getPrimaryKey())

  if (!query) {
    return next(new Error('Invalid primary key for Delete One: ' + instance.getPrimaryKey()))
  }

  collection.remove(query, function deletedOne (err, removed) {
    /* istanbul ignore if */
    if (err) {
      return next(err)
    }
    if (removed !== 1) {
      return next()
    }
    next(null, instance)
  })
}
