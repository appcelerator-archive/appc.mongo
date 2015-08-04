var MongoDB = require('mongodb'),
	ObjectID = MongoDB.ObjectID;

exports.findOne = function findOne(Model, value, next) {
	var collection = this.getCollection(Model),
		query;

	/* istanbul ignore else */
	if (typeof value === 'string' || value instanceof ObjectID) {
		query = this.createPrimaryKeyQuery(value);
	}

	if (!query) {
		return next(new Error('unexpected value for findOne: ' + value));
	}

	collection.findOne(query, {}, function (err, doc) {
		/* istanbul ignore if */
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
