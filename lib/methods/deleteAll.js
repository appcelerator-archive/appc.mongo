exports.deleteAll = function deleteAll(Model, next) {
	var collection = this.getCollection(Model),
		query = {};
	collection.remove(query, {multi: true, justOne: false}, function deletedAll(err, count) {
		/* istanbul ignore if */
		if (err) {
			return next(err);
		}
		if (count !== undefined && count > 0) {
			return next(null, count);
		}
		return next();
	});
};