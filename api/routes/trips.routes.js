var Firebase = require('firebase'),
  _ = require('lodash'),
  request = require('request'),
  moment = require('moment');

module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl),
  		users = root.child('users'),
  		requests = root.child('requests'),
  		trips = root.child('trips');

  app.route('/trips/:uuid').get(function (req, res) {
  	var data, uuid = req.params.uid,
  			id = req.query.request_id;

  	if (id) {
  		trips.child(uuid).child(id).once('value', function (snap) {
  			if (!snap.val()) {
  				res.sendStatus(404).json({ error: 'This trip was not found!' });
  			}
  			else {
  				data = snap.val();
  				res.json({ response: data });
  			}
  		});
  	}
  	else {
  		trips.child(uuid).once('value', function (snap) {
  			if (!snap.val()) {
  				res.sendStatus(404).json({ error: 'This user has no trips available!' });
  			}
  			else {
  				data = snap.val();
  				res.json({ response: data });
  			}
  		});
  	}
  });

  app.route('/trips/:uuid').post(function (req, res) {
  	var user, requestData, request_id, params,
  			uuid = req.params.uuid,
  			body = req.body;

  	if (!body) { res.sendStatus(400).json({ error: 'This request cannot be processed!' }); }
  	if (!body.request_id) { res.sendStatus(400).json({ error: 'Missing request id' }); }
  	else {
  		request_id = body.request_id;

  		requests.child(request_id).once('value', function (snap) {
  			if (!snap.val()) {
  				res.sendStatus(400).json({ error: 'This request could not be completed!' });
  			}

  			requestData = snap.val();
  			if (requestData.uid === uuid) {
  				users.child(uuid).once('value', function (snap) {
  					if (!snap.val()) {
  						res.sendStatus(400).json({ error: 'This request cannot be processed because the user cannot be found!' });
  					}

  					user = snap.val();

  					params = {
		  				url 		: 'https://sandbox-api.uber.com/v1/requests',
		  				headers	: {
								'Authorization': 'Bearer ' + user.accessToken,
								'Content-Type': 'application/json'
							},
							body		: JSON.stringify({
								product_id			: requestData.product.id,
								start_latitude	: requestData.location.latitude,
								start_longitude	: requestData.location.longitude,
								end_latitude		: requestData.destination.latitude,
								end_longitude		: requestData.destination.longitude
							})
		  			};

		  			request.post(params, function (err, response, body) {
		  				if (err) { res.sendStatus(400).json({ error: err }); }

		  				var i;
		  				body = JSON.parse(body);
		  				
		  				if (!body) { return res.sendStatus(400).json({ error: 'Unable to make request!' }); }

		  				if (body.driver === null) {
		  					body.driver = {
		  						name					: '',
		  						phone_number	: '',
		  						picture_url		: '',
		  						rating				: ''
		  					};
		  				}
		  				
		  				if (body.vehicle === null) {
		  					body.vehicle = {
		  						make					: '',
		  						model 				: '',
		  						picture_url		: '',
		  						license_plate	: ''
		  					};
		  				}

		  				if (body.location === null) {
		  					body.location = {
		  						bearing		: '',
		  						latitude 	: '',
		  						longitude : ''
		  					};
		  				}

		  				body.created = moment().format();
		  				
		  				trips.child(uuid).child(request_id).set(body, function (err) {
		  					if (err) { res.sendStatus(400).json({ error: err }); }
		  					
		  					res.json({ response: body });
		  				});
		  			});
  				});
  			}
  		});
  	}
  });
};
