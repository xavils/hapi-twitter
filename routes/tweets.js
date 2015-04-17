// routes/tweets.js
var Joi = require('joi');
var Auth = require('./auth');

exports.register = function(server, options, next) {
	//include routes
	server.route([
		{
			//Retrieve all users
			method:'GET',
			path: '/tweets',
			handler: function(request, reply) {
				var db = request.server.plugins['hapi-mongodb'].db;

				db.collection('tweets').find().toArray(function(err, tweets) {
					if (err) {
						return reply('Internal MongoDB error', err);
					}

					reply(tweets);
				});
			}
		},
		{
			//Retrieve a user's tweets
			method:'GET',
			path: '/users/{username}/tweets',
			handler: function(request, reply) {
				var db = request.server.plugins['hapi-mongodb'].db;
				var username = encodeURIComponent(request.params.username);
				
				db.collection('users').findOne({ "username": username}, function(err, user) {
					if (err) {
						return reply('Internal MongoDB error', err);
					}

					db.collection('tweets').find({ "user_id": user._id }).toArray(function(err, tweets) {
						if (err) {
							return reply('Internal MongoDB error', err);
						}
						reply(tweets);
					});
				});
			}
		},
		{
			//Get a user
			method: 'GET',	
			path: '/tweets/{id}',
			handler: function(request, reply) {
        var id = encodeURIComponent(request.params.user_id;
        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

        db.collection('users').findOne({ "_id" : ObjectID(id) }, function(err, writeResult) {
          if (err) throw err;
          reply(writeResult);
        })
      }
		},
		{
			//post a tweet
			method: 'POST',
			path: '/tweets',
			config: {
				handler: function(request, reply) {
					var db = request.server.plugins['hapi-mongodb'].db;
    			var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    			var session = request.session.get('hapi_twitter_session');
				
    			var tweet = {
    				"message": request.payload.tweet.message,
    				"user_id": ObjectID	(session.user_id)
    			};

					Auth.authenticated(request, function(result) {
						if (result.authenticated === true) {
        			db.collection('tweets').insert(tweet, function(err, writeResult) {
        				reply(writeResult);
        			})
						} else {
							reply(result.message);
						}
					});
				},
				validate: {
					payload: {
						tweet: {
							message: Joi.string().max(140).required()
						}
					}
				}
				
			}
		}
	]);

	next();
};

//give this file some attributes
exports.register.attributes = {
	name: 'tweets-route',
	version: '0.0.1'
};

//GET	/tweets	List all tweets
//GET	/users/{username}/tweets	List all Tweets of a specific user
//GET	/tweets/{id}	Retrieve a tweet
//POST	/tweets	Create a new tweet (require user authentication)
//DELETE	/tweets/{id}	Delete a Tweet (require user authentication)