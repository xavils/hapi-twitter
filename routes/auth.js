module.exports = {};

module.exports.authenticated = function(request, callback) {
	//retrieve session information from the browser	
	var session = request.session.get('hapi_twitter_session');

	if (!session) {
		return callback({
			"message": "Already logged out",
			"authenticated": false
		});
	}

	var db = request.server.plugins['hapi-mongodb'].db;
	db.collection('sessions').findOne({'session_id': session.session_id}, function(err, result) {
		if (result === null) {
			return callback({
				'message': 'Logged out',
				'authenticated': false
			});
		} else {
			return callback({
				'message': 'Logged in',
				'authenticated': true
			});
		}
	});
};