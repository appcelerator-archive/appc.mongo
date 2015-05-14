module.exports = function (Arrow, server) {
	return function save(Model, instance, next) {
		var collection = this.getCollection(Model),
			query = this.createPrimaryKeyQuery(instance.getPrimaryKey()),
			record = instance.toPayload();

		/* istanbul ignore if */
		if (!query) {
			return next(new Error('unexpected value for save: ' + instance.getPrimaryKey()));
		}

		collection.update(query, record, function saved(err, updated) {
			/* istanbul ignore if */
			if (err) {
				return next(err);
			}
			/* istanbul ignore if */
			if (updated != 1) {
				return next();
			}
			next(null, instance);
		});
	};
};