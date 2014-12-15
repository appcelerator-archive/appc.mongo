var _ = require('lodash'),
	pkginfo = require('pkginfo')(module) && module.exports,
	MongoDB = require('mongodb'),
	MongoClient = MongoDB.MongoClient,
	ObjectID = MongoDB.ObjectID;

// --------- Mongo DB connector -------

exports.create = function(APIBuilder, server) {

	var Connector = APIBuilder.Connector,
		Collection = APIBuilder.Collection;

	return Connector.extend({
		
		/*
		 Configuration.
		 */
		pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
		logger: APIBuilder.createLogger({}, { name: pkginfo.name, useConsole: true, level: 'debug' }),

		/*
		 Lifecycle.
		 */
		connect: function connect(next) {
			MongoClient.connect(this.config.url, function didConnect(err, db) {
				if (err) {
					return next(err);
				}
				this.db = db;
				next();
			}.bind(this));
		},
		disconnect: function disconnect(next) {
			if (this.db) {
				this.db.close(next);
				this.db = null;
			}
			else {
				next();
			}
		},

		/*
		 Metadata.
		 */
		fetchMetadata: function fetchMetadata(next) {
			next(null, {
				fields: [
					APIBuilder.Metadata.Text({
						name: 'url',
						description: 'mongodb connection url',
						required: true
					})
				]
			});
		},
		fetchSchema: function fetchSchema(next) {
			// only fetch if connected
			if (this.connected && this.db) {
				var schema = { objects: {} };
				// fetch all the collections available in this DB
				this.db.collections(function fetchedCollections(err, docs) {
					docs.forEach(function forEachDoc(collection) {
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

		/*
		 CRUD.
		 */
		create: function create(Model, values, next) {
			var payload = Model.instance(values, false).toPayload(),
				collection = getCollection(Model, this.db);

			collection.insert(payload, function didInsert(err, results) {
				if (err) {
					return next(err);
				}
				if (!results || !results.length) {
					return next();
				}
				next(null, createInstanceFromResult(Model, results[0]));
			});
		},
		findAll: function findAll(Model, next) {
			var collection = getCollection(Model, this.db);

			collection.find().toArray(function findAllArray(err, results) {
				if (err) {
					return next(err);
				}
				var array = [];
				for (var c = 0; c < results.length; c++) {
					array.push(createInstanceFromResult(Model, results[c]));
				}
				next(null, new Collection(Model, array));
			});
		},
		findOne: function findOne(Model, value, next) {
			var collection = getCollection(Model, this.db),
				query;

			if (typeof value === 'string') {
				value = createPrimaryKeyQuery(ObjectID(value));
			}
			if (value instanceof ObjectID) {
				query = createPrimaryKeyQuery(value);
			}
			else if (typeof value === 'object') {
				query = value;
			}
			else {
				return next(new Error('unexpected value for query: ' + value));
			}

			collection.findOne(query, function foundOne(err, doc) {
				if (err) {
					return next(err);
				}
				if (!doc) {
					return next();
				}
				var instance = createInstanceFromResult(Model, doc);
				next(null, instance);
			});
		},
		query: function query(Model, options, next) {
			var collection = getCollection(Model, this.db),
				queryParams = calculateQueryParams(options);

			collection.find(queryParams.where, queryParams.fields, {
				limit: options.limit || 10,
				skip: options.skip || 0,
				sort: queryParams.sort
			}, function queryResult(err, cursor) {
				if (err) { return next(err); }
				var array = [];
				cursor.each(function queryCursorEach(err, doc) {
					if (null === doc) {
						next(null, new Collection(Model, array));
					}
					else {
						array.push(createInstanceFromResult(Model, doc));
					}
				});
			});
		},
		save: function save(Model, instance, next) {
			var collection = getCollection(Model, this.db),
				query = createPrimaryKeyQuery(instance.getPrimaryKey()),
				record = instance.toPayload();

			collection.update(query, record, function saved(err, updated) {
				if (err) {
					return next(err);
				}
				if (updated != 1) {
					return next();
				}
				next(null, instance);
			});
		},
		'delete': function deleteOne(Model, instance, next) {
			var collection = getCollection(Model, this.db),
				query = createPrimaryKeyQuery(instance.getPrimaryKey());

			collection.remove(query, function deletedOne(err, removed) {
				if (err) {
					return next(err);
				}
				if (removed != 1) {
					return next();
				}
				next(null, instance);
			});
		},
		deleteAll: function deleteAll(Model, next) {
			var collection = getCollection(Model, this.db),
				query = {};

			collection.remove(query, { multi: true }, function deletedAll(err) {
				if (err) {
					return next(err);
				}
				return next();
			});
		}
	});

};

/*
 Utilities only used for this connector.
 */

/**
 * build a primary key query
 */
function createPrimaryKeyQuery(id) {
	return { _id: ObjectID(id) };
}

/**
 * return the collection based on the Model name or configured from metadata
 */
function getCollection(Model, db) {
	var name = Model.getMeta('collection') || Model.name,
		collection = db.collection(name, name);
	if (!collection) {
		throw new ORMError("no collection found with model named:" + name);
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

/**
 * Calculates the parameters for a query based on the provided options.
 * @param options
 * @returns {{fields: {}, where: (options.where|*|{}), sort: *}}
 */
function calculateQueryParams(options) {
	var fields = {},
		where = options.where || {},
		sort;

	for (var key in where) {
		if (where.hasOwnProperty(key)) {
			if (where[key] && where[key].$like) {
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
	return { fields: fields, where: where, sort: sort };
}
