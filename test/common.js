var should = require('should'),
	url = require('url'),
	shortId = require('shortid'),
	Arrow = require('arrow'),
	server = new Arrow(),
	log = server && server.logger || Arrow.createLogger({}, { name: 'mongo TEST' });

exports.Arrow = Arrow;
exports.server = server;
exports.log = log;

before(function before(next) {
	var connector = exports.connector = server.getConnector('appc.mongo');
	if (connector.config.url) {
		var mongoUrl = url.parse(connector.config.url);
		if (!connector.config.setup_for_test_already) {
			mongoUrl.pathname = mongoUrl.pathname + '-' + shortId.generate();
			connector.config.setup_for_test_already = true;
		}
		connector.config.url = url.format(mongoUrl);
		log.info('Mongo connection for test: ' + connector.config.url);
		// Create a test collection.
		require('mongodb').MongoClient.connect(connector.config.url, function didConnect(err, db) {
			if (err) {
				return next(err);
			}
			db.collection('super_post').insert([
				{ Hello: 'world!', Foo: 2 },
				{ Hello: 'sun!', Foo: 5 },
				{ divergentDocument: true },
				{ Hello: 'sky!', Foo: 7 },
				{ Hello: 'Earth!', Foo: 1 },
				{ Hello: 'birds!', Foo: 3 },
				{ How: 'are you today?!', Foo: 3 }
			], function() {
				server.start(next);
			});
		});
	}
	else {
		// The metadata will fail for us. Carry on.
		server.start(next);
	}
});

after(function after(next) {
	if (!exports.connector) {
		return server.stop(next);
	}
	exports.connector.db.dropDatabase(function(err) {
		if (err) {
			log.error(err.message);
		} else {
			log.info('Dropped test database at: ' + exports.connector.config.url);
		}
		server.stop(next);
	});
});