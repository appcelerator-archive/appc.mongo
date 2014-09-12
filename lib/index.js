var APIBuilder = require('apibuilder'),
	_ = require('lodash'),
	pkginfo = require('pkginfo')(module),
	pkginfo = module.exports,
	Connector = APIBuilder.Connector,
	MongoDB = require('mongodb'),
	MongoClient = MongoDB.MongoClient,
	ObjectID = MongoDB.ObjectID;

// --------- Mongo DB connector -------

module.exports = Connector.extend({

	// generated configuration
	config: APIBuilder.Loader(),
	name: 'mongodb',
	pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
	logger: APIBuilder.createLogger({}, {name: 'api-connector-mongo', useConsole: true, level: 'debug'}),

	// implementation

	constructor: function() {
	},
	customFieldTypeConverter: function (field, value, type) {
		// we are going to convert an ObjectID to a String for serialization
		if (value instanceof ObjectID) {
			return String(value);
		}
	},
	fetchConfig: function (next) {
		next(null, this.config);
	},
	fetchMetadata: function (next) {
		next(null, {
			fields: [
				APIBuilder.Metadata.URL({
					name: 'url',
					description: 'mongodb connnection url',
					required: true
				})
			]
		});
	},
	fetchSchema: function (next) {
		// only fetch if connected
		if (this.connected && this.db) {
			var schema = {};
			// fetch all the collections available in this DB
			this.db.collections(function (err, docs) {
				docs.forEach(function (collection) {
					var name = collection.collectionName;
					// exclude system collections
					if (!/^system\./.test(name)) {
						// add to our schema and indicate that this
						// object is schemaless (meaning it's not defined ahead of time)
						schema.objects[name] = {
							schemaless: true
						};
					}
				});
				next(null, schema);
			});
		}
		else {
			next();
		}
	},
	connect: function (next) {
		this.logger.info('connect', this.config.url);
		MongoClient.connect(this.config.url, function (err, db) {
			if (err) return next(err);
			this.db = db;
			next();
		}.bind(this));
	},
	disconnect: function (next) {
		this.logger.info('disconnect');
		if (this.db) {
			this.db.close(next);
		}
		else {
			next();
		}
	},
	create: function (Model, doc, next) {
		var connector = this,
			collection = getCollection(Model, this.db);
		collection.insert(doc, function (err, result) {
			if (err) return next(err);
			if (!result || !result.length) return next();
			var instance = createInstanceFromResult(Model, result[0]);
			console.log(instance);
			next(null, instance);
		});
	},
	delete: function (Model, instance, next) {
		var connector = this,
			collection = getCollection(Model, this.db),
			query = createPrimaryKeyQuery(Model, instance.getPrimaryKey());
		collection.remove(query, function (err, doc) {
			if (err) return next(err);
			if (!doc) return next();
			next(null, Model);
		});
	},
	findOne: function (Model, value, next) {
		var connector = this,
			collection = getCollection(Model, this.db),
			query;

		if (typeof value === 'string') {
			value = createPrimaryKeyQuery(Model, ObjectID(value));
		}

		if (value instanceof ObjectID) {
			query = createPrimaryKeyQuery(Model, value);
		} else if (typeof value === 'object') {
			query = value;
		} else {
			return next(new Error('unexpected value for query: ' + value));
		}

		collection.findOne(query, function (err, doc) {
			if (err) return next(err);
			if (!doc) return next();
			var instance = createInstanceFromResult(Model, doc);
			console.log(instance);
			next(null, instance);
		});
	},
	find: function (Model, query, next) {
		var connector = this,
			collection = getCollection(Model, this.db);
		collection.findOne(query, function (err, doc) {
			if (err) return next(err);
			if (!doc) return next();
			var instance = createInstanceFromResult(Model, doc);
			console.log(instance);
			next(null, instance);
		});
	},
	findAll: function (Model, next) {
		var name = Model.getMetadata('collection'),
			collection = getCollection(Model, this.db);
		collection.find().toArray(function (err, results) {
			if (err) return next(err);
			var array = [];
			for (var c = 0; c < results.length; c++) {
				array.push(Model.new(results[c]));
			}
			next(null, array);
		});
	},
	update: function (Model, next) {
		var connector = this,
			doc = Model.valuesForSaving(),
			collection = getCollection(Model, this.db),
			query = createPrimaryKeyQuery(Model);
		collection.update(query, doc, function (err, doc) {
			if (err) return next(err);
			if (!doc) return connector.notFoundError(next);
			next(null, Model);
		});
	}
});

/**
 * build a primary key query
 */
function createPrimaryKeyQuery(Model, id) {
	return { _id: ObjectID(id) };
}

/**
 * return the collection based on the Model name or configured from metadata
 */
function getCollection(Model, db) {
	var name = Model.getMeta('collection');
	return db.collection(name || Model.name);
}

function createInstanceFromResult(Model, result) {
	var instance = Model.instance(result, true);
	instance.setPrimaryKey(String(result._id));
	return instance;
}
