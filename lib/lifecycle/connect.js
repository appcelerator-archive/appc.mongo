var MongoDB = require('mongodb'),
	MongoClient = MongoDB.MongoClient;

/**
 * Connects to your data store; this connection can later be used by your connector's methods.
 * @param next
 */
exports.connect = function connect(next) {
	var self = this;
	MongoClient.connect(this.config.url, function didConnect(err, db) {
		if (err) {
			return next(err);
		}
		self.db = db;
		next();
	});
};
