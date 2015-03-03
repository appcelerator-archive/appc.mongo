var _ = require('lodash');

exports.create = function (Arrow, server) {
	return Arrow.Connector.extend(_.defaults(
		require('./config')(Arrow, server),
		require('./lifecycle')(Arrow, server),
		require('./metadata')(Arrow, server),
		{
			create: require('./method.create')(Arrow, server),
			findAll: require('./method.findAll')(Arrow, server),
			findAndModify: require('./method.findAndModify')(Arrow, server),
			findOne: require('./method.findOne')(Arrow, server),
			query: require('./method.query')(Arrow, server),
			save: require('./method.save')(Arrow, server),
			upsert: require('./method.upsert')(Arrow, server),
			distinct: require('./method.distinct')(Arrow, server),
			'delete': require('./method.delete')(Arrow, server),
			deleteAll: require('./method.deleteAll')(Arrow, server)
		},
		require('./utility')(Arrow, server)
	));
};