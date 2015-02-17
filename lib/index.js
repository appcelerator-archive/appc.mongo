var _ = require('lodash'),
	async = require('async'),
	pkginfo = require('pkginfo')(module) && module.exports,
	defaultConfig = require('fs').readFileSync(__dirname + '/../conf/example.config.js', 'utf8'),
	MongoDB = require('mongodb'),
	MongoClient = MongoDB.MongoClient,
	ObjectID = MongoDB.ObjectID;

// --------- Mongo DB connector -------

exports.create = function(Arrow, server) {

	var Connector = Arrow.Connector,
		Collection = Arrow.Collection;

	return Connector.extend({

		/*
		 Configuration.
		 */
		pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
		logger: server && server.logger || Arrow.createLogger({}, { name: pkginfo.name }),
		translateWhereRegex: true,
		defaultConfig: defaultConfig,

		/*
		 Lifecycle.
		 */
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
						if (!this.config.dontGenerateModelsFromSchema) {
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
		},

		/*
		 Metadata.
		 */
		fetchMetadata: function fetchMetadata(next) {
			next(null, {
				fields: [
					Arrow.Metadata.Text({
						name: 'url',
						description: 'mongodb connection url',
						required: true
					})
				]
			});
		},
		fetchSchema: function fetchSchema(next) {
			// only fetch if connected
			if (this.db) {
				var schema = { objects: {} };
				// fetch all the collections available in this DB
				this.db.collections(function fetchedCollections(err, collections) {
					async.each(collections, function forEachCollection(collection, callback) {
						var name = collection.collectionName;
						// exclude system collections
						if (/^system\./.test(name)) {
							return callback();
						}
						collection.find().sort({ $natural: -1 }).limit(100).toArray(function findSchemaArray(err, results) {
							if (err) {
								return callback(err);
							}
							var schemas = {},
								schemaCounts = {},
								max = { count: 0, schema: undefined };
							for (var i = 0; i < results.length; i++) {
								var result = results[i],
									hash = '',
									map = {},
									keys = Object.keys(result).sort();
								for (var j = 0; j < keys.length; j++) {
									var key = keys[j];
									// Skip _id.
									if (key === '_id') {
										continue;
									}
									hash += key + '(' + (typeof result[key]) + ');';
									map[key] = typeof result[key];
								}
								if (hash) {
									schemas[hash] = map;
									schemaCounts[hash] = !schemaCounts[hash] ? 1 : (schemaCounts[hash] + 1);
									if (schemaCounts[hash] > max.count) {
										max.count = schemaCounts[hash];
										max.schema = hash;
									}
								}
							}
							schema.objects[name] = {
								schemaless: true
							};
							if (max.count > 0) {
								var maxSchema = schemas[max.schema],
									fields = schema.objects[name].fields = {};
								for (var fieldName in maxSchema) {
									if (maxSchema.hasOwnProperty(fieldName)) {
										fields[fieldName] = { type: maxSchema[fieldName] };
									}
								}
							}
							return callback();
						});
					}, function(err) {
						if (err) {
							next(err);
						}
						else {
							next(null, schema);
						}
					});
				});
			}
			else {
				next();
			}
		},
		createModelsFromSchema: function() {
			var models = {};
			var objects = this.schema.objects;
			for (var modelName in objects) {
				if (objects.hasOwnProperty(modelName)) {
					var Model = Arrow.Model.extend(pkginfo.name + '/' + modelName, {
						name: pkginfo.name + '/' + modelName,
						autogen: this.config.modelAutogen === undefined ? true : this.config.modelAutogen,
						fields: objects[modelName].fields || {},
						connector: this
					});
					models[pkginfo.name + '/' + modelName] = Model;
					if (server) {
						server.addModel(Model);
					}
				}
			}
			this.models = _.defaults(this.models || {}, models);
			if (server) {
				server.registerModelsForConnector(this, this.models);
			}
		},

		/*
		 CRUD.
		 */
		create: function create(Model, values, next) {
			var payload = Model.instance(values, false).toPayload(),
				collection = this.getCollection(Model);

			collection.insert(payload, function didInsert(err, results) {
				if (err) {
					return next(err);
				}
				if (!results || !results.length) {
					return next();
				}
				next(null, this.createInstanceFromResult(Model, results[0]));
			}.bind(this));
		},
		distinct: function distinct(Model, field, options, next) {
			var collection = this.getCollection(Model);

			collection.distinct(field, options.where, function(err, results) {
				if (err) {
					return next(err);
				}
				next(null, results);
			}.bind(this));
		},
		findAll: function findAll(Model, next) {
			var collection = this.getCollection(Model);

			collection.find().limit(1000).toArray(function findAllArray(err, results) {
				if (err) {
					return next(err);
				}
				var array = [];
				for (var c = 0; c < results.length; c++) {
					array.push(this.createInstanceFromResult(Model, results[c]));
				}
				next(null, new Collection(Model, array));
			}.bind(this));
		},
		findAndModify: function findAll(Model, options, doc, args, next) {
			options.sel = Model.translateKeysForPayload(options.sel);
			options.unsel = Model.translateKeysForPayload(options.unsel);
			options.where = Model.translateKeysForPayload(options.where);
			options.order = Model.translateKeysForPayload(options.order);
			var collection = this.getCollection(Model),
				queryParams = this.calculateQueryParams(options);

			var order = [];
			if(options.order){
				Object.keys(options.order).forEach(function(k){
					order.push([k, options.order[k]]);
				});
			}

			if(typeof args === "function"){
				next = args;
				args = {};
			}

			collection.findAndModify(queryParams.where, order, doc, args, function (err, record) {
				if (err) {
					return next(err);
				}
				if(!record || Object.keys(record).length === 0){
					next(null, record);
				} else {
					next(null, this.createInstanceFromResult(Model, record));
				}
			}.bind(this));
		},
		findOne: function findOne(Model, value, next) {
			var collection = this.getCollection(Model),
				query, projection;

			if (typeof value === 'string' || value instanceof ObjectID) {
				query = this.createPrimaryKeyQuery(value);
			}
			else if (typeof value === 'object') {
				if(value.where){
					query = value.where;
					projection = value.sel || {};
				} else {
					query = value;
				}
			}

			if (!query) {
				return next(new Error('unexpected value for findOne: ' + value));
			}

			collection.findOne(query, projection, function foundOne(err, doc) {
				if (err) {
					return next(err);
				}
				if (!doc) {
					return next();
				}
				var instance = this.createInstanceFromResult(Model, doc);
				next(null, instance);
			}.bind(this));
		},
		query: function query(Model, options, next) {
			options.sel = Model.translateKeysForPayload(options.sel);
			options.unsel = Model.translateKeysForPayload(options.unsel);
			options.where = Model.translateKeysForPayload(options.where);
			options.order = Model.translateKeysForPayload(options.order);
			var collection = this.getCollection(Model),
				queryParams = this.calculateQueryParams(options);

			collection.find(queryParams.where, queryParams.fields, {
				limit: options.limit,
				skip: options.skip,
				sort: options.order
			}, function queryResult(err, cursor) {
				if (err) { return next(err); }
				var array = [];
				cursor.each(function queryCursorEach(err, doc) {
					if (null === doc) {
						next(null, new Collection(Model, array));
					}
					else {
						array.push(this.createInstanceFromResult(Model, doc));
					}
				}.bind(this));
			}.bind(this));
		},
		save: function save(Model, instance, next) {
			var collection = this.getCollection(Model),
				query = this.createPrimaryKeyQuery(instance.getPrimaryKey()),
				record = instance.toPayload();

			if (!query) {
				return next(new Error('unexpected value for findOne: ' + value));
			}

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
			var collection = this.getCollection(Model),
				query = this.createPrimaryKeyQuery(instance.getPrimaryKey());

			if (!query) {
				return next(new Error('unexpected value for findOne: ' + value));
			}

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
			var collection = this.getCollection(Model),
				query = {};

			collection.remove(query, { multi: true }, function deletedAll(err) {
				if (err) {
					return next(err);
				}
				return next();
			});
		},
		upsert: function upsert(Model, id, document, next) {
			var collection = this.getCollection(Model);

			collection.findAndModify({
				_id: id
			}, {}, document, { upsert: true }, function (err) {
				if (err) {
					return next(err);
				}
				next();
			}.bind(this));
		},


		/*
		 Utilities only used for this connector.
		 */

		/**
		 * build a primary key query
		 */
		createPrimaryKeyQuery: function createPrimaryKeyQuery(id) {
			try {
				return { _id: ObjectID(id) };
			}
			catch (err) {
				return null;
			}
		},

		/**
		 * return the collection based on the Model name or configured from metadata
		 */
		getCollection: function getCollection(Model) {
			var name = Model.getMeta('collection') || Model.name,
				collection = this.db.collection(name, name);
			if (!collection) {
				throw new ORMError("no collection found with model named:" + name);
			}
			return collection;
		},

		/**
		 * return a new instance from a Mongo query result
		 */
		createInstanceFromResult: function createInstanceFromResult(Model, result) {
			var instance = Model.instance(result, true);
			instance.setPrimaryKey(String(result._id));
			return instance;
		},

		/**
		 * Calculates the parameters for a query based on the provided options.
		 * @param options
		 * @returns {{fields: {}, where: (options.where|*|{})}}
		 */
		calculateQueryParams: function calculateQueryParams(options) {
			var fields = {},
				where = options.where || {};

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

			var order = options.order;
			if (order) {
				for (var orderKey in order) {
					if (order.hasOwnProperty(orderKey)) {
						if (typeof order[orderKey] === 'string') {
							order[orderKey] = parseInt(order[orderKey], 10);
						}
					}
				}
			}

			return { fields: fields, where: where };
		}

	});

};