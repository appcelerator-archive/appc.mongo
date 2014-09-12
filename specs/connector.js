var should = require('should'),
	async = require('async'),
	url = require('url'),
	shortId = require('shortid'),
	Connector = require('../'),
	APIBuilder = require('apibuilder'),
	log = APIBuilder.createLogger({}, {name: 'api-connector-mongo TEST', useConsole: true, level: 'info'}),
	Loader = APIBuilder.Loader,
	config = new Loader('../conf'),
	connector = new Connector(config),
	Model;

describe("Connector", function () {

	before(function (next) {
		var mongoUrl = url.parse(connector.config.url);
		mongoUrl.pathname = mongoUrl.pathname + '-' + shortId.generate();
		connector.config.url = url.format(mongoUrl);
		log.info('Mongo connection for test: ' + connector.config.url);


		// define your model
		Model = APIBuilder.Model.extend('post', {
			fields: {
				title: {type: String},
				content: {type: String}
			},
			connector: connector,
			metadata: {
				mongodb: {
					collection: 'Posts'
				}
			}
		});

		should(Model).should.be.an.object;

		connector.connect(next);
	});

	after(function (next) {
		connector.db.dropDatabase(function(err, done) {
			if (err) {
				log.error(err.message);
			} else {
				log.info('Dropped test database at: ' + connector.config.url);
			}
			connector.disconnect(next);
		});
	});

	it("should be able to fetch config", function (next) {
		connector.fetchConfig(function (err, config) {
			should(err).be.not.ok;
			should(config).be.an.object;
			should(Object.keys(config)).containEql('url');
			next();
		});
	});

	it("should be able to fetch metadata", function (next) {
		connector.fetchMetadata(function (err, meta) {
			should(err).be.not.ok;
			should(meta).be.an.object;
			should(Object.keys(meta)).containEql('fields');
			next();
		});
	});

	it("should be able to fetch schema", function (next) {
		connector.fetchSchema(function (err, schema) {
			should(err).be.not.ok;
			should(schema).be.an.object;
			next();
		});
	});

	it("should be able to create instance", function (next) {

		var content = 'Hello world',
			title = 'Test',
			object = {
				content: content,
				title: title
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;
			should(instance.getPrimaryKey()).be.a.String;
			should(instance.get('content')).equal(content);
			should(instance.get('title')).equal(title);
			instance.delete(next);
		});

	});

	it("should be able to fetch schema with posts collection", function (next) {
		connector.fetchSchema(function (err, schema) {
			should(err).be.not.ok;
			should(schema).be.an.object;
			should(schema.objects.Posts.schemaless).be.true;
			next();
		});
	});

	it("should be able to find an instance by ID", function (next) {

		var content = 'Hello world',
			title = 'Test',
			object = {
				content: content,
				title: title
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var id = instance.getPrimaryKey();
			Model.find(id, function(err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.object;
				should(instance2.getPrimaryKey()).equal(id);
				should(instance2.get('title')).equal(title);
				should(instance2.get('content')).equal(content);
				instance.delete(next);
			});

		});

	});

	it("should be able to find an instance by field value", function (next) {

		var content = 'Hello world',
			title = 'Test',
			object = {
				content: content,
				title: title
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var query = { title: title };
			Model.find(query, function(err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.object;
				should(instance2.getPrimaryKey()).equal(instance.getPrimaryKey());
				should(instance2.get('title')).equal(title);
				should(instance2.get('content')).equal(content);
				instance.delete(next);
			});

		});

	});

	it("should be able to find all instances", function (next) {

		var posts = [
			{
				title: 'Test1',
				content: 'Hello world'
			},
			{
				title: 'Test2',
				content: 'Goodbye world'
			}];

		Model.create(posts, function (err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(posts.length);

			var keys = [];
			coll.forEach(function(post) {
				keys.push(post.getPrimaryKey());
			});

			Model.find(function(err, coll2) {
				// TODO - check with Jeff whether Model.findAll ought to return a collection wrapper like Model.create does for arrays
				should(err).be.not.ok;
				should(coll2.length).equal(coll.length);

				coll2.forEach(function(post, i) {
					should(post.getPrimaryKey()).equal(keys[i]);
				});

				async.eachSeries(coll2, function(post, next_) {
					post.delete(next_);
				}, function(err) {
					next(err);
				});
			});

		});

	});

	it("should be able to update an instance", function (next) {

		var content = 'Hello world',
			title = 'Test',
			object = {
				content: content,
				title: title
			};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var id = instance.getPrimaryKey();
			Model.find(id, function(err, instance2) {
				should(err).be.not.ok;

				instance2.set('content', 'Goodbye world');
				instance2.save(function(err, result) {
					should(err).be.not.ok;

					should(result).be.an.object;
					should(result.getPrimaryKey()).equal(id);
					should(result.get('title')).equal(title);
					should(result.get('content')).equal('Goodbye world');
					instance.delete(next);
				});

			});

		});

	});

});