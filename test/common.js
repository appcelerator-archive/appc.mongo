var should = require('should'),
	url = require('url'),
	shortId = require('shortid'),
	Arrow = require('arrow'),
	server = new Arrow(),
	log = server && server.logger || Arrow.createLogger({}, {name: 'mongo TEST'});

exports.Arrow = Arrow;
exports.server = server;
exports.log = log;

before(function before(next) {
	exports.connector = server.getConnector('appc.mongo');
	var mongoURL = exports.connector.config.url;

	log.info('Mongo connection for test: ' + mongoURL);
	// Create a test collection.
	require('mongodb').MongoClient.connect(mongoURL, function didConnect(err, db) {
		if (err) {
			return next(err);
		}
		db.collection('super_post').insert([
			{Hello: 'world!', Foo: 2},
			{Hello: 'sun!', Foo: 5},
			{divergentDocument: true},
			{Hello: 'sky!', Foo: 7},
			{Hello: 'Earth!', Foo: 1},
			{Hello: 'birds!', Foo: 3},
			{How: 'are you today?!', Foo: 3}
		], function () {
			server.start(next);
		});
	});
});

after(function after(next) {
	server.stop(next);
});