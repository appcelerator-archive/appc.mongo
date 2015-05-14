module.exports = function (Arrow, server) {
	var Collection = Arrow.Collection;
	return function findAll(Model, next) {
		var collection = this.getCollection(Model);

		collection.find().limit(1000).toArray(function findAllArray(err, results) {
			/* istanbul ignore if */
			if (err) {
				return next(err);
			}
			var array = [];
			for (var c = 0; c < results.length; c++) {
				array.push(this.createInstanceFromResult(Model, results[c]));
			}
			next(null, new Collection(Model, array));
		}.bind(this));
	};
};