var Bcrypt = require('bcrypt');
var Joi = require('joi');	

exports.register = function(server, options, next) {
	//include routes
	server.route([
		{
			//Retrieve all users
			method:'GET',
			path: '/users',
			handler: function(request, reply) {
				var db = request.server.plugins['hapi-mongodb'].db;

				db.collection('users').find().toArray(function(err, users) {
					if (err) {
						return reply('Internal MongoDB error', err);
					}

					reply(users);
				});
			}
		},
		{
			//Create a user
			method: 'POST',	
			path: '/signup',
			config: {
				handler: function(request, reply) {
					var newuser = request.payload.users;
      		var db = request.server.plugins['hapi-mongodb'].db;

        	Bcrypt.genSalt(10, function(err, salt){
	        	Bcrypt.hash(newuser.password, salt, function(err, hash){
	        		newuser.password = hash;
	        	
			        var uniqUserQuery = {
			        	$or: [
			        		{username: newuser.username},
			        		{email: newuser.email}
			        ]};

			        db.collection('users').count(uniqUserQuery, function(err, userExist){
			        	if (userExist) {
			        		return reply('Error: Username already exists', err)
			        	}

				      	db.collection('users').insert( newuser, function(err, writeResult){
				          if (err) {
				            return reply(Hapi.error.internal('Internal MongoDB Error', err));
				          } else {
				            reply(writeResult);
				          }
				        });
			        });
		        })
	        });
				},
				validate: {
					payload: {
						users: {
							username: Joi.string().min(3).max(20).required(),
							email: Joi.string().email().max(50).required(),
							password: Joi.string().min(5).max(20).required()
						}
					}
				}
			}
		},
		{
			//Get a user
			method: 'GET',	
			path: '/users/{userID}',
			handler: function(request, reply) {
        var id = encodeURIComponent(request.params.userID);
        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

        db.collection('users').findOne({ "_id" : ObjectID(id) }, function(err, writeResult) {
          if (err) throw err;
          reply(writeResult);
        })
      }
		}
	]);

	next();
};

//give this file some attributes
exports.register.attributes = {
	name: 'users-route',
	version: '0.0.1'
};