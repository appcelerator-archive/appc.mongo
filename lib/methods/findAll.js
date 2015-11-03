var Arrow = require('arrow'),
	Collection = Arrow.Collection;

exports.findAll = function findAll(Model, next) {
	var self = this,
		collection = this.getCollection(Model);

	collection.find().limit(1000).toArray(function findAllArray(err, results) {
		/* istanbul ignore if */
		if (err) {
			return next(err);
		}
		var array = [];
		for (var c = 0; c < results.length; c++) {
			array.push(self.createInstanceFromResult(Model, results[c]));
		}
		next(null, new Collection(Model, array));
	});
};
