module.exports = function (Arrow, server) {
	return function upsert(Model, id, document, next) {
		var collection = this.getCollection(Model);

		var query = { _id: id };
		if (typeof id === 'string' || id instanceof ObjectID) {
			query = this.createPrimaryKeyQuery(id);
		}

		collection.findAndModify(query, {}, document, { upsert: true }, function (err) {
			if (err) {
				return next(err);
			}
			next();
		}.bind(this));
	};
};