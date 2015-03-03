module.exports = function (Arrow, server) {
	return function save(Model, instance, next) {
		var collection = this.getCollection(Model),
			query = this.createPrimaryKeyQuery(instance.getPrimaryKey()),
			record = instance.toPayload();

		if (!query) {
			return next(new Error('unexpected value for findOne: ' + value));
		}

		collection.update(query, record, function saved(err, updated) {
			if (err) {
				return next(err);
			}
			if (updated != 1) {
				return next();
			}
			next(null, instance);
		});
	};
};