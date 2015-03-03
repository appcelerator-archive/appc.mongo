module.exports = function (Arrow, server) {
	return function upsert(Model, id, document, next) {
		var collection = this.getCollection(Model);

		collection.findAndModify({
			_id: id
		}, {}, document, { upsert: true }, function (err) {
			if (err) {
				return next(err);
			}
			next();
		}.bind(this));
	};
};