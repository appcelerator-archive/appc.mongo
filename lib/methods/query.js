var Arrow = require('arrow')
var Collection = Arrow.Collection

exports.query = function query (Model, options, next) {
  var self = this
  var collection = this.getCollection(Model)
  options = this.translateQueryKeys(Model, options)
  options = this.calculateQueryParams(options)

  if (typeof options.order === 'string') {
    options.order = options.order
      .split(',')
      .reduce(function (res, prop) {
        res[prop] = 1
        return res
      }, {})
  }

  collection.find(options.where, options.fields, {
    limit: options.limit,
    skip: options.skip,
    sort: options.order
  }, function (err, cursor) {
    /* istanbul ignore if */
    if (err) { return next(err) }
    var array = []
    cursor.each(function (err, doc) {
      if (err) {
        next(err)
      }
      if (doc === null) {
        next(null, new Collection(Model, array))
      } else {
        array.push(self.createInstanceFromResult(Model, doc))
      }
    })
  })
}
