module.exports = {
	connectors: {
		'appc.mongo': {
			url: 'mongodb://localhost/arrow',

			// Create models based on the schema that can be used in your API.
			generateModelsFromSchema: true,

			// Whether or not to generate APIs based on the methods in generated models. 
			modelAutogen: false
		}
	}
};