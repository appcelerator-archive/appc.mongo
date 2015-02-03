module.exports = {
	logs: './logs',
	quiet: false,
	logLevel: 'debug',
	apikey: 'bYVrelF3EQ8qGaJj/SoSlTyP6IhtA+1Y',
	requireSessionLogin: false,
	admin: {
		enabled: true,
		prefix: '/arrow'
	},
	connectors: {
		'appc.mongo': {
			url: 'mongodb://localhost/arrow'
		}
	}
};
