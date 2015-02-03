var should = require('should'),
	common = require('./common'),
	Arrow = common.Arrow,
	server = common.server;

describe('Lifecycle', function() {

	var connector = server.getConnector('appc.mongo');

	it('should be able to fetch metadata', function(next) {
		connector.fetchMetadata(function(err, meta) {
			should(err).be.not.ok;
			should(meta).be.an.Object;
			should(Object.keys(meta)).containEql('fields');
			next();
		});
	});

	it('should be able to fetch schema', function(next) {
		connector.fetchSchema(function(err, schema) {
			should(err).be.not.ok;
			should(schema).be.an.Object;
			should(schema.objects.Posts.schemaless).be.true;
			next();
		});
	});

	it('should be able to handle bad connection strings', function(next) {
		var Connector = require('../lib/index').create(Arrow, server),
			connector = new Connector({ url: 'mongodb://0.0.0.0:65000' });
		connector.connect(function(err) {
			should(err).be.ok;
			next();
		});
	});

	it('should be able to disconnect multiple times', function(next) {
		var Connector = require('../lib/index').create(Arrow, server),
			connector = new Connector(server.config.connectors['appc.mongo'] || server.config);
		connector.connect(function(err) {
			should(err).be.not.ok;
			connector.disconnect(function(err) {
				should(err).be.not.ok;
				connector.disconnect(next);
			});
		});
	});

	it('API-320: should create models from tables', function() {
		var SuperPost = connector.getModel('appc.mongo/super_post');
		should(SuperPost).be.ok;
		should(SuperPost.fields).be.ok;
		should(Object.keys(SuperPost.fields).length).equal(2);
		should(SuperPost.fields._id).be.not.ok;
		should(SuperPost.fields.Hello).be.ok;
		should(SuperPost.fields.Hello.type).be.ok;
		should(SuperPost.fields.Hello.type).equal('string');
		should(SuperPost.fields.Foo).be.ok;
		should(SuperPost.fields.Foo.type).be.ok;
		should(SuperPost.fields.Foo.type).equal('number');
	});

});