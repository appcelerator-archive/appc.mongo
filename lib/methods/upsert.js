var MongoDB = require('mongodb'),
	ObjectID = MongoDB.ObjectID;

module.exports = function (Arrow, server) {
	return function upsert(Model, id, document, next) {
		var collection = this.getCollection(Model);

		var query = { _id: id };
		if (typeof id === 'string' || id instanceof ObjectID) {
			query = this.createPrimaryKeyQuery(id);
		}

		collection.findAndModify(query, {}, document, { upsert: true, new: true }, function (err, result) {
			/* istanbul ignore if */
			if (err) {
				return next(err);
			}
			next(null, this.createInstanceFromResult(Model, result));
		}.bind(this));
	};
};