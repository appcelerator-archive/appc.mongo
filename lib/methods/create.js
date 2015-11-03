exports.create = function create(Model, values, next) {
	var payload = Model.instance(values, false).toPayload(),
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
		next(null, this.createInstanceFromResult(Model, results.ops[0]));
	}.bind(this));
};
