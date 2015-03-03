var MongoDB = require('mongodb'),
	ObjectID = MongoDB.ObjectID;

module.exports = function (Arrow, server) {
	return function findOne(Model, value, next) {
		var collection = this.getCollection(Model),
			query, projection;

		if (typeof value === 'string' || value instanceof ObjectID) {
			query = this.createPrimaryKeyQuery(value);
		}
		else if (typeof value === 'object') {
			if (value.where) {
				query = value.where;
				projection = value.sel || {};
			} else {
				query = value;
			}
		}

		if (!query) {
			return next(new Error('unexpected value for findOne: ' + value));
		}

		collection.findOne(query, projection || {}, function (err, doc) {
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