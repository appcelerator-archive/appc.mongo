var MongoDB = require('mongodb'),
	MongoClient = MongoDB.MongoClient;

module.exports = function (Arrow, server) {
	return {
		connect: function connect(next) {
			MongoClient.connect(this.config.url, function didConnect(err, db) {
				if (err) {
					return next(err);
				}
				this.db = db;
				this.fetchSchema(function fetchedSchema(err, schema) {
					if (err) {
						next(err);
					}
					else {
						this.schema = schema;
						if (this.config.generateModelsFromSchema === undefined || this.config.generateModelsFromSchema) {
							this.createModelsFromSchema();
						}
						next();
					}
				}.bind(this));
			}.bind(this));
		},
		disconnect: function disconnect(next) {
			var db = this.db;
			if (db) {
				this.db = null;
				db.close(next);
			}
			else {
				next();
			}
		}
	};
};