var Firebase 			= require('firebase');
var needle       	= require('needle');
var _            	= require('lodash');

module.exports = function (app, config) {
	var root = new Firebase(config.firebase.rootRefUrl);
	var requestsRef = root.child('requests'),
			usersRef 		= root.child('users');

	app.route('/users/:id/requests').get(function (req, res) {
		var uid = req.params.id;

		// return requests for a particular user
		usersRef.child(uid).once('value', function (snap) {
			if (!snap.val()) {
				// If the user doesn't exist, return an error message
				return res.json({error: 'User not found!'});
			}
			// retrieve all requests
			requestsRef.once('value', function (snap) {
				if (snap.val()) {
					var id, userRequests = [], requests = snap.val();
					for (id in requests) {
						if (requests[id].uid === uid) {
							// if user has requests available, push them into an array
							requests[id].id = id;
							userRequests.push(requests[id]);
						}
					}
					if (userRequests) {
						return res.json({response: userRequests});
					}
					else {
						// if user has no requests, return an error message
						return res.json({error: 'This user has no requests!'});
					}
				}
				else {
					// if there are no requests, return an error message
					return res.json({error: 'There are no requests!'});
				}
			});
		});
		
	});

	app.route('/users/:id/requests').post(function (req, res) {
		var uid 		= req.params.id,
				request = req.body;

		// create a new request for a user
		usersRef.child(uid).once('value', function (snap) {
			if (!snap.val()) {
				// If the user doesn't exist, return an error message
				return res.json({error: 'User not found!'});
			}
			request['uid'] = uid;
			requestsRef.push(request, function (err) {
				if (!err) {
					return res.json({response: request});
				}
				return res.json({error: 'Unable to create request'});
			});
		});
	});

	app.route('/users/:uuid/requests/:id').delete(function (req, res) {
		var uuid	= req.params.uuid,
				id	= req.params.id;
		console.log(uuid, id);

		// delete an existing request
		usersRef.child(uuid).once('value', function (snap) {
			if (!snap.val()) {
				// If the user doesn't exist, return an error message
				return res.json({error: 'User not found!'});
			}
			requestsRef.child(id).once('value', function (snap) {
				if (!snap.val()) {
					// if the request doesn't exist, return an error message
					return res.json({error: 'Request not found!'});
				}
				// if the request exists, delete it from the firebase requests
				snap.ref().remove(function (err) {
					if (!err) {
						return res.json({response: 'Successfully deleted!'});
					}
				});
			});
		});
	});
};