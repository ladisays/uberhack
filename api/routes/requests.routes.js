var Firebase = require('firebase');
var needle = require('needle');
var _ = require('lodash');
var OAuth = require('oauth');
var geocoder = require('geocoder');
var request = require('request');
var moment = require('moment');


module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl);
  var requestsRef = root.child('requests'),
      usersRef = root.child('users'),
      tripsRef = root.child('trips');

  app.route('/users/:id/requests').get(function(req, res) {
    var uid = req.params.id;

    // return requests for a particular user
    usersRef.child(uid).once('value', function(snap) {
      if (!snap.val()) {
        // If the user doesn't exist, return an error message
        return res.sendStatus(400).json({ error: 'User not found!' });
      }
      // retrieve all requests
      requestsRef.once('value', function(snap) {
        if (snap.val()) {
          var id, userRequests = [],
              requests = snap.val();
          for (id in requests) {
            if (requests[id].uid === uid) {
              // if user has requests available, push them into an array
              requests[id].id = id;
              userRequests.push(requests[id]);
            }
          }
          if (userRequests) {
            return res.json({
              response: userRequests
            });
          } else {
            // if user has no requests, return an error message
            return res.sendStatus(400).json({
              error: 'This user has no requests!'
            });
          }
        } else {
          // if there are no requests, return an error message
          return res.sendStatus(400).json({
            error: 'There are no requests!'
          });
        }
      });
    });

  });

  app.route('/users/:id/requests').post(function(req, res) {
    var user, params, product, products,
    		options = { sensor: true },
    		uid = req.params.id,
    		data = req.body;

    console.log('\n\nRequest body...\n--------------------\n', data);

    if (!data) { res.sendStatus(400).json({ error: 'Invalid request!' }); }

    if (!data.destination) { res.sendStatus(400).json({ error: 'No destination address!' }); }

    if (!data.startTime) { res.sendStatus(400).json({ error: 'No Start Time!' }); }

    if (!data.productType) { res.sendStatus(400).json({ error: 'No Uber product was found!' }); }

    if (!data.location) { res.sendStatus(400).json({ error: 'No location details!' }); }

  	geocoder.geocode(data.location, function (err, coords) {
      if (err) {
        console.log(err);
        return res.sendStatus(400).json({ error: 'Unable to get co-ordinates for the pickup location!' });
      }

      if (!coords.results[0].formatted_address || (!coords.results[0].geometry.location.lat && !coords.results[0].geometry.location.lng)) {
      	return res.sendStatus(400).json({ error: 'Invalid address supplied for your pickup location!' });
      }

      data.location = {
      	address 		: coords.results[0].formatted_address,
      	latitude 		: coords.results[0].geometry.location.lat,
      	longitude 	: coords.results[0].geometry.location.lng
      };

	    usersRef.child(uid).once('value', function (snap) {
	    	if (!snap.val()) { res.sendStatus(400).json({ error: 'User does not exist!' }); }

	    	data.uid = uid;

	    	user = snap.val();
	    	params = {
		      url: 'https://api.uber.com/v1/products',
		      qs: {
		      	server_token 	: config.uber.server_token,
		        latitude 			: data.location.latitude,
		        longitude 		: data.location.longitude
		      }
		    };

		    request.get(params, function (err, response, body) {
		      if (err) { res.sendStatus(400).json({ error: err }); }

		      if (!body) { return res.sendStatus(400).json({ error: 'Could not get an Uber product!' }); }

		      body = JSON.parse(body);
		      console.log('\n\nUber products...\n-------------------------\n', body);

		      products = body.products;

		      if (!products) {
		      	return res.sendStatus(400).json({ error: 'Unable to find products in your area!' });
		      }

		      for (i in  products) {
		      	if (products[i].display_name == data.productType) {
		      		product = products[i];
		      	}
		      }

		      data.product = {
		      	id 		: product.product_id,
		      	type 	: data.productType
		      };

		      // Remove unwanted key from the object
		      delete data['productType'];

		      // Get the destination co-ordinates
		      geocoder.geocode(data.destination, function (err, address) {
		      	if (err) { res.sendStatus(400).json({ error: 'Unable to calculate co-ordinates for your destination address!' }); }

		      	if (!coords.results[0].formatted_address || (!coords.results[0].geometry.location.lat && !coords.results[0].geometry.location.lng)) {
		      		return res.sendStatus(400).json({ error: 'Invalid destination address!' });
		      	}

						data.destination = {
							address 		: address.results[0].formatted_address,
							latitude 		: address.results[0].geometry.location.lat,
							longitude 	: address.results[0].geometry.location.lng
						};

						// Set the params object for making a call to Uber's Estimate endpoint
						params.url = 'https://sandbox-api.uber.com/v1/requests/estimate';
						params.headers = {
							'Authorization': 'Bearer ' + user.accessToken,
							'Content-Type': 'application/json'
						};

						params.body = JSON.stringify({
							start_latitude		: data.location.latitude,
							start_longitude		: data.location.longitude,
							end_latitude			: data.destination.latitude,
							end_longitude			: data.destination.longitude,
							product_id				: data.product.id
						});

						params.qs = {};

						// Get the estimated duration for the requested trip
			  		request.post(params, function (err, response, body)  {
			  			if (err) { res.sendStatus(400).json({ error: err }); }

			  			if (!body) {
			  				return res.sendStatus(400).json({ error: 'Unable to calculate estimates! Please, try again later!' });
			  			}

			  			body = JSON.parse(body);
			  			var duration_estimate = body.trip.duration_estimate,
			  					pickup_estimate = body.pickup_estimate,
			  					time = moment(data.startTime).subtract(15, 'minutes').format(),
			  					reminder = moment(time).subtract(duration_estimate, 'seconds').format();

			  			data.estimates = {
			  				duration: duration_estimate,
			  				reminder: reminder
			  			};

			  			data.created = moment().format();

							requestsRef.push(data, function (err) {
								if (!err) {
									console.log('\n\nPushing to firebase...\n--------------------------\n', data);
									res.json({ response: data });
								}
								else {
									res.sendStatus(400).json({ message: 'Unable to save data to firebase!', error: err });
								}
							});
			  		});
			  	}, options);
		    });
	    });
		}, options);
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