var _ = require('lodash');

exports.create = function (Arrow, server) {
	return Arrow.Connector.extend(_.defaults(
		require('./config')(Arrow, server),
		require('./lifecycle')(Arrow, server),
		require('./metadata')(Arrow, server),
		{
			create: require('./methods/create')(Arrow, server),
			findAll: require('./methods/findAll')(Arrow, server),
			findAndModify: require('./methods/findAndModify')(Arrow, server),
			findOne: require('./methods/findOne')(Arrow, server),
			query: require('./methods/query')(Arrow, server),
			save: require('./methods/save')(Arrow, server),
			upsert: require('./methods/upsert')(Arrow, server),
			distinct: require('./methods/distinct')(Arrow, server),
			'delete': require('./methods/delete')(Arrow, server),
			deleteAll: require('./methods/deleteAll')(Arrow, server)
		},
		require('./utility')(Arrow, server)
	));
};