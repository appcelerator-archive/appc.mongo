var MongoDB = require('mongodb'),
	ObjectID = MongoDB.ObjectID;

exports.findOne = function findOne(Model, value, next) {
	var self = this,
		collection = this.getCollection(Model),
		query;

	/* istanbul ignore else */
	if (typeof value === 'string' || value instanceof ObjectID) {
		query = this.createPrimaryKeyQuery(value);
	}

	if (!query) {
		return next(new Error('Invalid Value for Find One: ' + value));
	}

	collection.findOne(query, {}, function (err, doc) {
		/* istanbul ignore if */
		if (err) {
			return next(err);
		}
		if (!doc) {
			return next();
		}
		var instance = self.createInstanceFromResult(Model, doc);
		next(null, instance);
	});
};
