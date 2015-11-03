exports.save = function save(Model, instance, next) {
	var collection = this.getCollection(Model),
		query = this.createPrimaryKeyQuery(instance.getPrimaryKey()),
		record = instance.toPayload();

	/* istanbul ignore if */
	if (!query) {
		return next(new Error('Invalid primary key for Save: ' + instance.getPrimaryKey()));
	}

	collection.update(query, record, function saved(err, updated) {
		/* istanbul ignore if */
		if (err) {
			return next(err);
		}
		next(null, instance);
	});
};
