var Arrow = require('arrow'),
	_ = require('lodash'),
	Collection = Arrow.Collection;

exports.count = function count(Model, options, next) {
	if (_.isFunction(options) && !next) {
		next = options;
		options = {};
	}
	var collection = this.getCollection(Model);
	options = this.translateQueryKeys(Model, options);
	options = this.calculateQueryParams(options);

	collection.find(options.where, function (err, cursor) {
		/* istanbul ignore if */
		if (err) { return next(err); }
		cursor.count(next);
	});
};
