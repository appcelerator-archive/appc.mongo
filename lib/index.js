var Mobware = require('mobware2'),
		_ = require('lodash'),
		pkginfo = require('pkginfo')(module),
		pkginfo = module.exports,
		MongoDB = require('mongodb'),
		MongoClient = MongoDB.MongoClient,
		ObjectID = MongoDB.ObjectID;

exports = module.exports = Connector;

// --------- Mongo DB connector -------

function Connector(obj) {
	return Mobware.createConnector(obj,{

		// pull in metadata from our package.json for this connector
		pkginfo: _.pick(pkginfo,'name','version','description','author','license','keywords','repository'),

		// implementation methods
		name: 'mongodb',

		customFieldTypeConverter: function(field,value,type){
			// we are going to convert an ObjectID to a String for serialization
			if (value instanceof ObjectID) {
				return String(value);
			}
		},
		fetchConfig: function(next) {
			next(null, this.config);
		},
		fetchMetadata: function(next){
			var metadata = {
					fields: [
						Mobware.Metadata.URL({
							name: 'url',
							description: 'url for connector',
							required: true
						})
					]
			};
			next(null, metadata);
		},
		fetchSchema: function(next){
			// only fetch if connected
			if (this.connected && this.db) {
				var schema = {};
				// fetch all the collections available in this DB
				this.db.collections(function(err,docs){
					docs.forEach(function(collection){
						var name = collection.collectionName;
						// exclude system collections
						if (!/^system\./.test(name)) {
							// add to our schema and indicate that this
							// object is schemaless (meaning it's not defined ahead of time)
							schema.objects[name]={
								schemaless: true
							};
						}
					});
					next(null, schema);
				});
			}
			else {
				next(null, schema);
			}
		},
		connect: function(next) {
			this.logger.info('connect',this.config.url);
			MongoClient.connect(this.config.url, function(err,db){
				if (err) return next(err);
				this.db = db;
				next();
			}.bind(this));
		},
		disconnect: function(next){
			this.logger.info('disconnect');
			if (this.db) {
				this.db.close(next);
			}
			else {
				next();
			}
		},
		readOne: function(model, id, next) {
			var connector = this,
				collection = getCollection(model, this.db),
				query = createPrimaryKeyQuery(model,id);
			collection.findOne(query,function(err,doc){
				if (err) return next(err);
				if (!doc) return connector.notFoundError(next);
				model.set(doc);
				next(null,model);
			});
		},
		readAll: function(model, next){
			var name = model.getMetadata('collection'),
				collection = getCollection(model, this.db);
			collection.find().toArray(function(err,results){
				if (err) return next(err);
				var array = [];
				for (var c=0;c<results.length;c++) {
					array.push(model.new(results[c]));
				}
				next(null, array);
			});
		},
		create: function(model, next){
			var connector = this,
				doc = model.valuesForSaving(),
				collection = getCollection(model, this.db);
			collection.insert(doc, function(err,result){
				if (err) return next(err);
				if (!result) return connector.notFoundError(next);
				next(null, model);
			});
		},
		update: function(model, next){
			var connector = this,
				doc = model.valuesForSaving(),
				collection = getCollection(model, this.db),
				query = createPrimaryKeyQuery(model);
			collection.update(query,doc,function(err,doc){
				if (err) return next(err);
				if (!doc) return connector.notFoundError(next);
				next(null,model);
			});
		},
		delete: function(model, id, next) {
			var connector = this,
				collection = getCollection(model, this.db),
				query = createPrimaryKeyQuery(model, id);
			collection.remove(query, function(err,doc){
				if (err) return next(err);
				if (!doc) return connector.notFoundError(next);
				next(null,model);
			});
		}
	});
}

/**
 * build a primary key query
 */
function createPrimaryKeyQuery(model, id) {
	var query = {},
		field = model.getPrimaryKey();
	query[field] = ObjectID(id || model.getPrimaryKeyValue());
	return query;
}

/**
 * return the collection based on the model name or configured from metadata
 */
function getCollection(model, db){
	var name = model.getMetadata('collection');
	return db.collection(name || model.name);
}
