var _ = require('lodash'),
	pkginfo = require('pkginfo')(module) && module.exports;

module.exports = function (Arrow, server) {
	return {
		pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
		logger: server && server.logger,
		translateWhereRegex: true
	};
};