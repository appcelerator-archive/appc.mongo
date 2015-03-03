module.exports = function (Arrow, server) {
	return function create(Model, values, next) {
		var payload = Model.instance(values, false).toPayload(),
			collection = this.getCollection(Model);

		collection.insert(payload, function didInsert(err, results) {
			if (err) {
				return next(err);
			}
			if (!results || !results.length) {
				return next();
			}
			next(null, this.createInstanceFromResult(Model, results[0]));
		}.bind(this));
	};
};