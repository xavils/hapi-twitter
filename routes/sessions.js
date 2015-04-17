var Bcrypt = require('bcrypt');
var Auth = require('./auth');
//var Joi = require('joi');

exports.register = function(server, options, next) {
	//include routes
	server.route([
		{
			//Retrieve all users
			method:'POST',
			path: '/sessions',
			//config: {
				handler: function(request, reply) {
					var user = request.payload.user;
	    		var db = request.server.plugins['hapi-mongodb'].db;

	      	//Bcrypt.genSalt(10, function(err, salt){
	        	//Bcrypt.hash(user.password, salt, function(err, hash){
	        		//user.password = hash;
	        	
			        //var uniqUserQuery = {
			        	//$or: [
			        		//{username: user.username},
			        //]};

			        db.collection('users').findOne({'username': user.username}, function(err, userMongo){
			        	if (err) {
			        		return reply('Internal MongoDB error', err);
			        	}
			        	if (userMongo === null) {
			        		return reply({'message' : "User doesn't exist"});
			        	}

			        	Bcrypt.compare(user.password, userMongo.password, function(err, matched){
			        		if (matched) {
			        			function randomKeyGenerator() {
									    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
									  }
									   
									  // Generate a random key
									  var randomKey = (randomKeyGenerator() + randomKeyGenerator() + "-" + randomKeyGenerator() + "-4" + randomKeyGenerator().substr(0,3) + "-" + randomKeyGenerator() + "-" + randomKeyGenerator() + randomKeyGenerator() + randomKeyGenerator()).toLowerCase();
			        			
			        			// Create a session
			        			var newSession = {
			        				"session_id": randomKey,
			        				"user_id": userMongo._id
			        			}

			        			db.collection('sessions').insert(newSession, function(err, writeResult){
			        				if (err) { return reply('Internal MongoDB error', err)}
			        					console.log("Session inserted in the db");
			        				request.session.set('hapi_twitter_session', {
			        					'session_id': randomKey,
			        					'user_id': userMongo._id
			        				})

			        				return reply(writeResult);
			        			});

			        		} else {
				        		return reply({'message' : 'Not authorized'});
				        	}
			        	});
			        });
			        	

				    //  	db.collection('users').insert( user, function(err, writeResult){
				    //      if (err) {
				    //        return reply(Hapi.error.internal('Internal MongoDB Error', err));
				    //      } else {
				    //        reply(writeResult);
				    //      }
				    //    });
			      //  });
		        //});
	        //});
		  //  },	
			//	validate: {
			//		payload: {
			//			user: {
			//				username: Joi.string().min(3).max(20).required(),
			//				password: Joi.string().min(5).max(20).required()
			//			}
			//		}
			//	}
		  }  
		},
		{
			method: 'GET',
			path: '/authenticated',
			handler: function(request, reply) {
				Auth.authenticated(request, function(result)
					{
					reply(result);
				})
			}
		},
		{
			method: 'DELETE',
			path: '/sessions',
			handler: function(request, reply) {
				var session = request.session.get('hapi_twitter_session');
				var db = request.server.plugins['hapi-mongodb'].db;

				if (!session) {
					return reply({ "message": "Already logged out" });
				}

				db.collection('sessions').remove({ "session_id": session.session_id },
					function(err, writeResult){
						if (err) { return reply('Internal MongoDB error', err); }
				});
			}
		}
	]);

	next();
};

//give this file some attributes
exports.register.attributes = {
	name: 'sessions-route',
	version: '0.0.1'
};