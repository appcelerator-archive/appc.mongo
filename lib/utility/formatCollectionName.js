/**
 * Strips out the connector name part and returns the collection name.
 * 
 * For example, if the name is "appc.mongo/user", returns just "user".
 */
exports.formatCollectionName = function formatCollectionName(name) {
	var i = name && name.indexOf('/');
	if (i > 0) {
		return name.substring(i + 1);
	}
	return name;
};
	