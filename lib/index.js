var appc = require('appcelerator'),
	_ = appc.lodash,
	pkginfo = require('pkginfo')(module) && module.exports,
	MongoDB = require('mongodb'),
	MongoClient = MongoDB.MongoClient,
	ObjectID = MongoDB.ObjectID;

// --------- Mongo DB connector -------

exports.create = function(APIBuilder, server) {

	var Connector = APIBuilder.Connector,
		Collection = APIBuilder.Collection;

	return Connector.extend({

		// generated configuration
		config: APIBuilder.Loader(),
		name: 'mongodb',
		pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
		logger: APIBuilder.createLogger({}, { name: 'api-connector-mongo', useConsole: true, level: 'debug' }),

		// implementation

		constructor: function() {
		},
		customFieldTypeConverter: function(field, value, type) {
			// we are going to convert an ObjectID to a String for serialization
			if (value instanceof ObjectID) {
				return String(value);
			}
		},
		fetchConfig: function(next) {
			next(null, this.config);
		},
		fetchMetadata: function(next) {
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
		fetchSchema: function(next) {
			// only fetch if connected
			if (this.connected && this.db) {
				var schema = { objects: {} };
				// fetch all the collections available in this DB
				this.db.collections(function(err, docs) {
					docs.forEach(function(collection) {
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
		connect: function(next) {
			//this.logger.info('connect', this.config.url);
			MongoClient.connect(this.config.url, function(err, db) {
				if (err) return next(err);
				this.db = db;
				next();
			}.bind(this));
		},
		disconnect: function(next) {
			//this.logger.info('disconnect');
			if (this.db) {
				this.db.close(next);
			}
			else {
				next();
			}
		},
		create: function(Model, doc, next) {
			var connector = this,
				collection = getCollection(Model, this.db);
			collection.insert(doc, function(err, results) {
				if (err) return next(err);
				if (!results || !results.length) return next();
				next(null, createInstanceFromResult(Model, results[0]));
			});
		},
		delete: function(Model, instance, next) {
			var collection = getCollection(Model, this.db),
				query = createPrimaryKeyQuery(Model, instance.getPrimaryKey());
			collection.remove(query, function(err, removed) {
				if (err) return next(err);
				if (removed != 1) return next();
				next(null, instance);
			});
		},
		findOne: function(Model, value, next) {
			var collection = getCollection(Model, this.db),
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

			collection.findOne(query, function(err, doc) {
				if (err) return next(err);
				if (!doc) return next();
				var instance = createInstanceFromResult(Model, doc);
				next(null, instance);
			});
		},
		find: function(Model, query, next) {
			var collection = getCollection(Model, this.db);
			collection.findOne(query, function(err, doc) {
				if (err) return next(err);
				if (!doc) return next();
				var instance = createInstanceFromResult(Model, doc);
				next(null, instance);
			});
		},
		query: function(Model, options, next) {
			var collection = getCollection(Model, this.db),
				fields = {},
				where = options.where || {},
				sort;

			for (var key in where) {
				if (where.hasOwnProperty(key)) {
					if (where[key].$like) {
						where[key] = new RegExp(where[key].$like.replace(/%/g, '.*'));
					}
				}
			}

			if (options.sel) {
				Object.keys(options.sel).forEach(function(key) {
					fields[key] = true;
				});
			}
			if (options.unsel) {
				Object.keys(options.unsel).forEach(function(key) {
					fields[key] = false;
				});
			}

			if (options.page && options.per_page) {
				// Translate page/per_page to skip/limit, because that's what we can handle.
				options.skip = (options.page - 1) * options.per_page;
				options.limit = options.per_page;
			}

			if (options.sort) {
				sort = [];
				options.sort.split(',').forEach(function(property) {
					if (property[0] === '-') {
						sort.push([property.substr(1), 'desc']);
					}
					else {
						sort.push([property, 'asc']);
					}
				});
			}

			collection.find(where, fields, {
				limit: options.limit || 10,
				skip: options.skip || 0,
				sort: sort
			}, function(err, cursor) {
				if (err) { return next(err); }
				var array = [];
				cursor.each(function(err, doc) {
					if (null === doc) {
						next(null, new Collection(Model, array));
					}
					else {
						array.push(createInstanceFromResult(Model, doc));
					}
				});
			});

		},
		findAll: function(Model, next) {
			var collection = getCollection(Model, this.db);
			collection.find().toArray(function(err, results) {
				if (err) return next(err);
				var array = [];
				for (var c = 0; c < results.length; c++) {
					array.push(createInstanceFromResult(Model, results[c]));
				}
				next(null, new Collection(Model, array));
			});
		},
		save: function(Model, instance, next) {
			var collection = getCollection(Model, this.db),
				query = createPrimaryKeyQuery(Model, instance.getPrimaryKey()),
				doc = {};

			Model.keys().forEach(function(key) {
				doc[key] = instance.get(key);
			});

			collection.update(query, doc, function(err, updated) {
				if (err) return next(err);
				if (updated != 1) return next();
				next(null, instance);
			});
		}
	});

};

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
	var name = Model.getMeta('collection') || Model.name,
		collection = db.collection(name, name);
	if (!collection) {
		throw new ORMError("no collection found with model named:"+name);
	}
	return collection;
}

/**
 * return a new instance from a Mongo query result
 */
function createInstanceFromResult(Model, result) {
	var instance = Model.instance(result, true);
	instance.setPrimaryKey(String(result._id));
	return instance;
}
