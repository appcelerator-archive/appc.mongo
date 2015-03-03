var _ = require('lodash'),
	async = require('async'),
	pkginfo = require('pkginfo')(module) && module.exports;

module.exports = function (Arrow, server) {
	return {
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
									if (key === '_id' || key.toLowerCase() === 'id') {
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
					}, function (err) {
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
		createModelsFromSchema: function () {
			var models = {};
			var objects = this.schema.objects;
			for (var modelName in objects) {
				if (objects.hasOwnProperty(modelName)) {
					var Model = Arrow.Model.extend(pkginfo.name + '/' + modelName, {
						name: pkginfo.name + '/' + modelName,
						autogen: this.config.modelAutogen === undefined ? true : this.config.modelAutogen,
						fields: objects[modelName].fields || {},
						connector: this,
						generated: true
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
		}
	};
};