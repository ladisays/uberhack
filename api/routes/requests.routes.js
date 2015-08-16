var Firebase = require('firebase');
var needle = require('needle');
var _ = require('lodash');
var OAuth = require('oauth');
var geocoder = require('geocoder');
var request = require('request');


module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl);
  var requestsRef = root.child('requests'),
      usersRef = root.child('users');

  app.route('/users/:id/requests').get(function(req, res) {
    var uid = req.params.id;

    // return requests for a particular user
    usersRef.child(uid).once('value', function(snap) {
      if (!snap.val()) {
        // If the user doesn't exist, return an error message
        return res.json({ error: 'User not found!' });
      }
      // retrieve all requests
      requestsRef.once('value', function(snap) {
        if (snap.val()) {
          var id, userRequests = [],
              requests = snap.val();
          for (id in requests) {
            if (requests[id].uid === uid) {
              // if user has requests available, push them into an array
              userRequests.push(requests[id]);
            }
          }
          if (userRequests) {
            return res.json({
              response: userRequests
            });
          } else {
            // if user has no requests, return an error message
            return res.json({
              error: 'This user has no requests!'
            });
          }
        } else {
          // if there are no requests, return an error message
          return res.json({
            error: 'There are no requests!'
          });
        }
      });
    });

  });

  app.route('/users/:id/requests').post(function(req, res) {
    var uid = req.params.id,
    		data = req.body;

    usersRef.child(uid).once('value', function (snap) {
    	if (!snap.val()) {
    		res.json({ error: 'User not found!' });
    	}
    	console.log('Checking firebase...', data);

    	var user = snap.val();
    	var params = {
	      url: 'https://api.uber.com/v1/products',
	      qs: {
	      	server_token: config.uber.server_token,
	        latitude: data.location.lat,
	        longitude: data.location.lng
	      }
	    };

	    request.get(params, function (err, response, body) {
	      if (err) {
	        res.json({ error: err });
	      }
	      body = JSON.parse(body);
	      console.log('\nGetting product from Uber API...', body);

	      var product, products = body.products;

	      for (i in  products) {
	      	if (products[i].display_name == data.productType) {
	      		// console.log(products[i]);
	      		product = products[i];
	      	}
	      }

	      data.product_id = product.product_id;

	      params.url = 'https://andelahack.herokuapp.com/location';
	      params.qs = { street: data.destination };

	      request.get(params, function (err, response, body) {
	      	if (err) {
	      		return { error: err };
	      	}

	      	body = JSON.parse(body);
					console.log('\nGetting location coordinates from backend...', body);

					params.url = 'https://sandbox-api.uber.com/v1/requests/estimates';
					params.headers = {
						'Authorization': 'Bearer ' + user.accessToken,
						'Content-Type': 'application/json'
					};
					params.body = JSON.stringify({
						start_latitude		: data.location.lat,
						start_longitude		: data.location.lng,
						end_latitude			: body.response.lat,
						end_longitude			: body.response.lng,
						product_id				: data.product_id
					});
					params.qs = {};

		  		request.post(params, function (err, response, body)  {
		  			if (err) {
		  				res.json({ error: err });
		  			}
		  			console.log('\nGetting estimates from Uber API...');
		  			console.log(response.statusCode);

		  			body = JSON.parse(body);
		  			console.log(body);
		  			res.json({ response: body });
		  		});
		  	});
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