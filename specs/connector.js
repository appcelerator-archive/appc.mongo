var should = require('should'),
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
				name: {type: String},
				type: {type: String},
				value: {type: String}
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

	it("should be able to fetch config", function (callback) {
		connector.fetchConfig(function (err, config) {
			should(err).be.not.ok;
			should(config).be.an.object;
			callback();
		});
	});

	it("should be able to fetch metadata", function (callback) {
		connector.fetchMetadata(function (err, config) {
			should(err).be.not.ok;
			should(config).be.an.object;
			callback();
		});
	});

	it("should be able to fetch schema", function (callback) {
		connector.fetchSchema(function (err, config) {
			should(err).be.not.ok;
			should(config).be.an.object;
			callback();
		});
	});

	it("should be able to create instance", function (callback) {

		var object = {
			content: 'Hello, world',
			title: 'Test'
		};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;
			console.log(instance);

			// TODO -- confirm with Jeff if this should indeed be a string
			// should(instance.getPrimaryKey()).be.a.String;
			should(instance.getPrimaryKey()).be.a.ObjectId;
			instance.delete(callback);
		});

	});

	it("should be able to find an instance by ID", function (callback) {

		var object = {
			content: 'Hello, world',
			title: 'Test'
		};

		Model.create(object, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.object;

			var id = instance.getPrimaryKey();

			Model.find(id, function(err, instance2) {
				should(err).be.not.ok;
				should(instance).be.an.object;
				instance2.getPrimaryKey().should.equal(id);
				instance.delete(callback);
			});

		});

	});
});