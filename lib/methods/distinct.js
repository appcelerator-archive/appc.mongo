module.exports = function (Arrow, server) {
	return function distinct(Model, field, options, next) {
		var collection = this.getCollection(Model);

		collection.distinct(field, options.where, function (err, results) {
			/* istanbul ignore if */
			if (err) {
				return next(err);
			}
			next(null, results);
		}.bind(this));
	};
};