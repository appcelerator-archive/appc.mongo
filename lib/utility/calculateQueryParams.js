/**
 * Translates the Arrow style query parameters to something more MongoDB like.
 * @param options
 * @returns {*}
 */
exports.calculateQueryParams = function calculateQueryParams (options) {
  var fields = {}
  var where = options.where

  if (options.sel) {
    Object.keys(options.sel).forEach(function (key) {
      fields[key] = true
    })
  }
  if (options.unsel) {
    Object.keys(options.unsel).forEach(function (key) {
      fields[key] = false
    })
  }

  var order = options.order
  if (order) {
    var orderKeys = Object.keys(order)
    for (var i = 0; i < orderKeys.length; i++) {
      var orderKey = orderKeys[i]
      if (typeof order[orderKey] === 'string') {
        order[orderKey] = parseInt(order[orderKey], 10)
      }
    }
  }

  if (Object.keys(where).length === 1 && where.id) {
    where = this.createPrimaryKeyQuery(where.id)
  }

  options.where = where
  options.fields = fields
  return options
}
