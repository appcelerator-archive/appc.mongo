exports.deleteAll = function deleteAll(Model, next) {
	var collection = this.getCollection(Model),
		query = {};
	collection.remove(query, {multi: true, justOne: false}, function deletedAll(err, count) {
		/* istanbul ignore if */
		if (err) {
			return next(err);
		}
		return next(null, count || 0);
	});
};