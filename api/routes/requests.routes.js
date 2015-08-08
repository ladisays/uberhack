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
                return res.json({
                    error: 'User not found!'
                });
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

    var getProducts = function(latitude, longitude, options) {
        var params = {
            url: 'https://api.uber.com/v1/products?server_token=' + config.uber.server_token,
            qs: {
                latitude: latitude,
                longitude: longitude
            }
        };
        request.get(params, function(err, response) {
            if (err) {
                console.log('err', err);
            } else {
                var productResponse = res.json({
                    response: JSON.parse(response.body).products
                });

                _.forEach(options, function() {
                    _.forEach(productResponse, function() {
                        var displayName = productResponse.display_name
                        if (displayName === options) {
                            return productResponse;
                        }
                    })
                })
            }
        });
    };

    app.route('/users/:id/request').post(function(req, res) {
        var uid = req.params.id,
            requestBody = req.body;

        var latitude = req.body.location.latitude;
        var longitude = req.body.location.longitude;
        var address = req.body.location.address;
        var destination = req.body.destination;
        var startTime = req.body.pickUpTime;
        var currentTime = req.body.requestTime;
        var options = req.body.uberType;

        // create a new request for a user
        usersRef.child(uid).once('value', function(snap) {
            if (!snap.val()) {
                // If the user doesn't exist, return an error message
                return res.json({
                    error: 'User not found!'
                });

            } else {

                requestBody['uid'] = uid;
                userDetails = snap.val();
                var access_token = userDetails.accessToken;
                requestsRef.push(requestBody, function(err) {
                    if (!err) {
                        var availableProduct = getProducts(latitude, longitude, options);

                        var params = {
                            url: 'https://api.uber.com/v1/requests/estimate',
                            headers: {
                                'Authorization': 'Bearer ' + access_token,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                start_latitude: latitude,
                                start_longitude: longitude,
                                product_id: availableProduct.product_id
                            })
                        };
                        request.post(params, function(err, response) {
                            if (err) {
                                console.log('err', err);
                            } else {

                                res.json({
                                    response: JSON.parse(response.body)
                                });
                            }
                        });

                    } else {
                        return res.json({
                            error: 'Unable to create request',
                            realError: err
                        });
                    }
                });
            }
        });
    });


    app.route('/users/:id/requests').post(function(req, res) {
        var uid = req.params.id,
            end_latitude, end_longitude,
            requestUid = req.params.requestId;


        requestsRef.child(requestUid).once('value', function(snapshot) {
        		var availableProduct = getProducts(latitude, longitude, options);
            requestData = snapshot.val();
            var destination = requestData.destination;
           

            geocoder.geocode(destination, function(err, data) {
                var geo = data.results[0].geometry.location;

                end_latitude = geo.lat;
                end_longitude = geo.lng;
                var start_latitude = requestData.location.latitude;
        				var start_longitude = requestData.location.longitude;

                usersRef.child(uid).once('value', function(snap) {
                    if (snap.val()) {
                        // If the user doesn't exist, return an error message

                        userDetails = snap.val();
                        var access_token = userDetails.accessToken;
                        var params = {
                            url: 'https://sandbox-api.uber.com/v1/requests',
                            headers: {
                                'Authorization': 'Bearer ' + access_token,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                start_latitude: start_latitude,
                                start_longitude: start_longitude,
                                end_latitude: end_latitude,
                                end_longitude: end_longitude,
                                product_id: availableProduct.product_id
                            })
                        };
                        request.post(params, function(err, response) {
                            if (err) {
                                console.log('err', err);
                            } else {
                                res.json({
                                    response: response.body
                                });
                            }
                        });

                    }
                });
            });
        });
    });

    app.route('/users/:id/requests').delete(function(req, res) {
        var uid = req.params.id,
            id = req.body.id;
        console.log(uid, id);

        // delete an existing request
        usersRef.child(uid).once('value', function(snap) {
            if (!snap.val()) {
                // If the user doesn't exist, return an error message
                return res.json({
                    error: 'User not found!'
                });
            }
            requestsRef.child(id).once('value', function(snap) {
                if (!snap.val()) {
                    // if the request doesn't exist, return an error message
                    return res.json({
                        error: 'Request not found!'
                    });
                }
                // if the request exists, delete it from the firebase requests
                snap.ref().remove(function(err) {
                    if (!err) {
                        return res.json({
                            response: 'Successfully deleted!'
                        });
                    }
                });
            });
        });
    });
};
