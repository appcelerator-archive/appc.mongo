var MongoDB = require('mongodb'),
	ObjectID = MongoDB.ObjectID;

module.exports = function (Arrow, server) {
	return function findOne(Model, value, next) {
		var collection = this.getCollection(Model),
			query;

		if (typeof value === 'string' || value instanceof ObjectID) {
			query = this.createPrimaryKeyQuery(value);
		}

		if (!query) {
			return next(new Error('unexpected value for findOne: ' + value));
		}

		collection.findOne(query, {}, function (err, doc) {
			if (err) {
				return next(err);
			}
			if (!doc) {
				return next();
			}
			var instance = this.createInstanceFromResult(Model, doc);
			next(null, instance);
		}.bind(this));
	};
};