var _ = require('lodash');

/**
 * Calls Model#translateKeysForPayload for various fields in options.
 *
 * @param Model
 * @param options
 */
exports.translateQueryKeys = function translateQueryKeys(Model, options) {
	options.sel = Model.translateKeysForPayload(options.sel);
	options.unsel = Model.translateKeysForPayload(options.unsel);
	options.where = _.pick(Model.translateKeysForPayload(options.where), Model.payloadKeys().concat(['id']));
	options.order = Model.translateKeysForPayload(options.order);
	return options;
};
	