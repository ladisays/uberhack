var Firebase 			= require('firebase');
var needle       	= require('needle');
var _            	= require('lodash');

module.exports = function (app, config) {
	var root = new Firebase(config.firebase.rootRefUrl);
	var requestsRef = root.child('requests');

	app.route('/requests/shared').get(function (req, res) {
		requestsRef.once('value', function (snap) {
			if (!snap.val()) {
				return res.json({error: 'There are currently no requests!'});
			}
			
			var id, sharedRequests = {}, requests = snap.val();
			for (id in requests) {
				if (requests[id].shared) {
					sharedRequests[id] = requests[id];
				}
			}

			console.log(sharedRequests);
			if (sharedRequests) {
				return res.json({response: sharedRequests});
			}
			else {
				return res.json({error: 'There are no shared requests!'});
			}
		});
	});
};