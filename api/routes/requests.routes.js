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

    var getLocationCoordinates = function() {

        geocoder.geocode("2/4 Funsho Street, Yaba Lagos", function(err, data) {
            var geo = data.results[0].geometry.location;
        });
    };

    app.route('/products').get(function(req, res) {
        var getProducts = function() {
            var params = {
                url: 'https://api.uber.com/v1/products?server_token=' + config.uber.server_token,
                qs: {
                    latitude: 6.506911,
                    longitude: 3.3840278
                }
            };
            request.get(params, function(err, response) {
                if (err) {
                    console.log('err', err);
                }
                else{
                res.json({response: JSON.parse(response.body).products});
              	}
            });
        };
        getProducts();
    });

    app.route('/users/:id/request').post(function(req, res) {
        var uid = req.params.id,
            requestBody = req.body;

        // create a new request for a user
        usersRef.child(uid).once('value', function(snap) {
            if (!snap.val()) {
                // If the user doesn't exist, return an error message
                return res.json({
                    error: 'User not found!'
                });
            }

            requestBody['uid'] = uid;
            userDetails = snap.val();
            var access_token = userDetails.accessToken;
            requestsRef.push(requestBody, function(err) {
                if (!err) {
                    var params = {
                        url: 'https://api.uber.com/v1/requests/estimate',
                        headers: {
                            'Authorization': 'Bearer ' + access_token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            start_latitude: 6.506911,
                            start_longitude: 3.3840278,
                            end_latitude: 6.613947,
                            end_longitude: 3.358154,
                            product_id: '21141cb0-76f7-4638-b26a-3122f27ce90a'
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
        });
    });

    app.route('/users/:id/requests/:requestId').post(function(req, res) {
        var uid = req.params.id,
            requestUid = req.params.requestId;


        requestsRef.child(requestUid).once('value', function(snapshot) {

            requestData = snapshot.val();



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
                        // body: JSON.stringify({
                        //     start_latitude: requestData.start_latitude,
                        //     start_longitude: requestData.start_longitude,
                        //     end_latitude: requestData.end_latitude,
                        //     end_longitude: requestData.end_longitude,
                        //     product_id: '21141cb0-76f7-4638-b26a-3122f27ce90a'
                        // })
                        body: JSON.stringify({
                            start_latitude: 6.506911,
                            start_longitude: 3.3840278,
                            end_latitude: 6.613947,
                            end_longitude: 3.358154,
                            product_id: '21141cb0-76f7-4638-b26a-3122f27ce90a'
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
