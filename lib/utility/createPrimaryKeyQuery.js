var MongoDB = require('mongodb')
var ObjectID = MongoDB.ObjectID

/**
 * Build a primary key query from the provided ID.
 * @param id
 * @returns {*}
 */
exports.createPrimaryKeyQuery = function createPrimaryKeyQuery (id) {
  try {
    return { _id: ObjectID(id) }
  } catch (err) {
    return null
  }
}
