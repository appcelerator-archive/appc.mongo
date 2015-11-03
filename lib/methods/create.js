exports.create = function create(Model, values, next) {
	var self = this,
		payload = Model.instance(values, false).toPayload(),
		collection = this.getCollection(Model);

	collection.insert(payload, function didInsert(err, results) {
		/* istanbul ignore if */
		if (err) {
			return next(err);
		}
		/* istanbul ignore if */
		if (!results.ops || !results.ops.length) {
			return next();
		}
		next(null, self.createInstanceFromResult(Model, results.ops[0]));
	});
};
