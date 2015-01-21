var should = require('should'),
	common = require('./common'),
	async = require('async'),
	APIBuilder = common.APIBuilder,
	Model;

describe('CRUD', function() {

	before(function() {
		Model = APIBuilder.Model.extend('post', {
			fields: {
				title: { type: String },
				content: { type: String }
			},
			connector: 'appc.mongo',
			metadata: {
				'appc.mongo': {
					collection: 'Posts'
				}
			}
		});
		should(Model).be.an.Object;
	});

	it('should be able to create instances', function(next) {

		var content = 'Hello world',
			title = 'Test',
			object = {
				content: content,
				title: title
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.a.String;
			should(instance.content).equal(content);
			should(instance.title).equal(title);
			instance.delete(next);
		});

	});

	it('should handle bad ids', function(next) {
		Model.findOne('a_bad_id', function(err) {
			should(err).be.ok;
			next();
		});
	});

	it('should be able to find an instance by ID', function(next) {

		var content = 'Hello world',
			title = 'Test',
			object = {
				content: content,
				title: title
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;

			var id = instance.getPrimaryKey();
			Model.find(id, function(err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.Object;
				should(instance2.getPrimaryKey()).equal(id);
				should(instance2.title).equal(title);
				should(instance2.content).equal(content);
				instance.delete(next);
			});

		});

	});

	it('should be able to find an instance by field value', function(next) {

		var content = 'Hello world',
			title = 'Test',
			object = {
				content: content,
				title: title
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;

			var query = { title: title };
			Model.find(query, function(err, coll) {
				should(err).be.not.ok;
				var instance2 = coll[0];
				should(instance2).be.an.Object;
				should(instance2.getPrimaryKey()).equal(instance.getPrimaryKey());
				should(instance2.title).equal(title);
				should(instance2.content).equal(content);
				instance.delete(next);
			});

		});

	});

	it('should be able to query', function(callback) {

		var content = 'Hello world',
			title = 'Test',
			object = {
				content: content,
				title: title
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;

			var options = {
				where: { content: { $like: 'Hello%' } },
				sel: { content: 1 },
				order: { content: 1, title: -1 },
				limit: 3,
				skip: 0
			};
			Model.query(options, function(err, coll) {
				should(err).be.not.ok;
				for (var i = 0; i < coll.length; i++) {
					var obj = coll[i];
					should(obj.getPrimaryKey()).be.a.String;
					should(obj.content).be.a.String;
					should(obj.title).be.not.ok;
				}

				var options = {
					where: { content: { $like: 'Hello%' } },
					unsel: { title: 1 },
					order: { content: 1, title: -1 },
					limit: 3,
					skip: 0
				};
				Model.query(options, function(err, coll) {
					should(err).be.not.ok;
					for (var i = 0; i < coll.length; i++) {
						var obj = coll[i];
						should(obj.getPrimaryKey()).be.a.String;
						should(obj.content).be.a.String;
						should(obj.title).be.not.ok;
					}
					
					Model.removeAll(callback);
				});
			});
		});

	});

	it('should be able to $like', function(callback) {

		async.eachSeries([
			{ insert: 'Hello world', where: 'Hello%' },
			{ insert: 'Hello world', where: '%world' },
			{ insert: 'Hello world', where: '%Hello%' },
			{ insert: '10% Off', where: '10%% %' },
			{ insert: '10% Off', where: '10\\% %' },
			{ insert: 'Hello world', where: 'Hello world' },
			{ insert: 'Hello world', where: 'He%ld' },
			{ insert: 'We use _.js', where: 'We % \\_._s' }
		], function(item, next) {
			Model.removeAll(function(err) {
				if (err) {
					return next(item.where + ' insert failed: ' + err);
				}
				Model.create({ title: item.insert }, function(err) {
					if (err) {
						return next(item.where + ' insert failed: ' + err);
					}
					Model.query({ where: { title: { $like: item.where } } }, function(err, coll) {
						if (err || !coll || !coll.length) {
							return next(item.where + ' lookup failed: ' + (err || 'none found'));
						}
						next();
					});
				});
			});
		}, callback);

	});

	it('should be able to find all instances', function(next) {

		var posts = [
			{
				title: 'Test1',
				content: 'Hello world'
			},
			{
				title: 'Test2',
				content: 'Goodbye world'
			}];

		Model.deleteAll(function(err) {
			should(err).be.not.ok;
			Model.create(posts, function(err, coll) {
				should(err).be.not.ok;
				should(coll.length).equal(posts.length);

				var keys = [];
				coll.forEach(function(post) {
					keys.push(post.getPrimaryKey());
				});

				Model.find(function(err, coll2) {
					should(err).be.not.ok;
					should(coll2.length).equal(coll.length);

					var array = [];

					coll2.forEach(function(post, i) {
						should(post.getPrimaryKey()).equal(keys[i]);
						array.push(post);
					});

					async.eachSeries(array, function(post, next_) {
						should(post).be.an.Object;
						post.delete(next_);
					}, function(err) {
						next(err);
					});
				});

			});
		});

	});

	it('should be able to update an instance', function(next) {

		var content = 'Hello world',
			title = 'Test',
			object = {
				content: content,
				title: title
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;

			var id = instance.getPrimaryKey();
			Model.find(id, function(err, instance2) {
				should(err).be.not.ok;

				instance2.set('content', 'Goodbye world');
				instance2.save(function(err, result) {
					should(err).be.not.ok;

					should(result).be.an.Object;
					should(result.getPrimaryKey()).equal(id);
					should(result.title).equal(title);
					should(result.content).equal('Goodbye world');
					instance.delete(next);
				});

			});

		});

	});

	it('should be able to map fields', function(next) {

		var Model = APIBuilder.Model.extend('account', {
				fields: {
					SuperName: { name: 'Name', type: String }
				},
				connector: 'appc.mongo'
			}),
			name = 'TEST: Hello world',
			object = {
				SuperName: name
			};

		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.SuperName).equal(name);
			instance.set('SuperName', name + 'v2');
			instance.save(function(err, result) {
				Model.findOne(instance.getPrimaryKey(), function(err, instance2) {
					should(instance2.SuperName).equal(name + 'v2');
					instance.delete(next);
				});
			});
		});

	});

	var cities = [
		{ city: 'Palo Alto' },
		{ city: 'Lake Tahoe' },
		{ city: 'Half Moon Bay' },
		{ city: 'Chicago' },
		{ city: 'Houston' },
		{ city: 'Fresno' },
		{ city: 'Paris' },
		{ city: 'Rome' }
	];

	it('API-371: should be able to query with $like', function(next) {

		var Model = APIBuilder.Model.extend('city', {
			fields: { city: { type: String } },
			connector: 'appc.mongo'
		});
		Model.create(cities, function(err) {
			should(err).be.not.ok;

			Model.query({
				where: { city: { $like: '%o' } },
				page: 2, per_page: 2
			}, function(err, coll) {
				should(err).be.not.ok;
				should(coll.length).equal(1);
				should(coll[0].city).equal('Fresno');
				Model.deleteAll(next);
			});

		});

	});

	it('API-372: should order properly and flexibly', function(next) {

		var Model = APIBuilder.Model.extend('city', {
			fields: { city: { type: String } },
			connector: 'appc.mongo'
		});
		Model.create(cities, function(err) {
			should(err).be.not.ok;

			Model.query({ order: { city: '-1' } }, function(err, coll) {
				should(err).be.not.ok;
				should(coll[0].city).equal('Rome');
				should(coll[cities.length - 1].city).equal('Chicago');
				Model.deleteAll(next);
			});

		});

	});

});