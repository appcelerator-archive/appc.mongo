/**
 * Disconnects from your data store.
 * @param next
 */
exports.disconnect = function disconnect(next) {
	var db = this.db;
	this.db = null;
	db.close(next);
};
