module.exports = function (Arrow, server) {
	return function deleteOne(Model, instance, next) {
		var collection = this.getCollection(Model),
			query = this.createPrimaryKeyQuery(instance.getPrimaryKey());

		if (!query) {
			return next(new Error('unexpected value for deleteOne: ' + query));
		}

		collection.remove(query, function deletedOne(err, removed) {
			if (err) {
				return next(err);
			}
			if (removed != 1) {
				return next();
			}
			next(null, instance);
		});
	};
};