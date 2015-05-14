module.exports = function (Arrow, server) {
	return function findAndModify(Model, options, doc, args, next) {
		var collection = this.getCollection(Model);
		options = this.translateQueryKeys(Model, options);
		options = this.calculateQueryParams(options);

		var order = [];
		if (options.order) {
			Object.keys(options.order).forEach(function (k) {
				order.push([k, options.order[k]]);
			});
		}

		if (typeof args === "function") {
			next = args;
			args = {};
		}

		collection.findAndModify(options.where, order, doc, args, function (err, record) {
			/* istanbul ignore if */
			if (err) {
				return next(err);
			}
			if (!record || Object.keys(record).length === 0) {
				next(null, record);
			} else {
				next(null, this.createInstanceFromResult(Model, record));
			}
		}.bind(this));
	};
};