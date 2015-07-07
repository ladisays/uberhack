var Firebase = require('firebase');
var needle       = require('needle');
var _            = require('lodash');
var OAuth        = require('oauth');
var request     = require('request');

module.exports = function(app, config) {

  var root = new Firebase(config.firebase.rootRefUrl);

  var OAuth2 = OAuth.OAuth2;

  var oauth2 = new OAuth2(
    config.uber.clientId,
    config.uber.secretKey,
    "",
    config.uber.authorize_url,
    config.uber.access_token_url,
    config.uber.base_uber_url
  )

  var parameters = {
    'response_type': 'code',
    'redirect_uri': config.uber.redirect_url,
    'scope': 'profile'
  }

  app.route('/users').get(function(req, res) {
    var login_url = oauth2.getAuthorizeUrl(parameters);
    console.log(login_url);

    res.redirect(login_url);
  });

  app.route('/uber/callback').get(function(req, resp) {
    var code = req.query.code;

    console.log('code:', code);

    var parameters = {
      'redirect_uri': config.uber.redirect_url,
      'code':         code,
      'grant_type':   'authorization_code',
      client_id: config.uber.clientId,
      client_secret: config.uber.secretKey
    }

    oauth2.getOAuthAccessToken(code, parameters, function(err, access_token, refresh_token, results) {
      if (err) {
        console.log(err);
      }

      var access_token = results.access_token;

      var url = 'https://api.uber.com/v1/me';
      request.get(url, {
        auth:  {'bearer': access_token},
        json: true
      }, function (err, res, data) {
        if (err) {
          console.log(err);
        } else {
         console.log('Response: ', data);
         data.accessToken = access_token;
         root.child('users').child(data.uuid).once('value', function (snap) {
          if(snap.val()) {
            console.log('User exists');
            resp.send({message: 'User found', response: data});
          }
          else {
            root.child('users').child(data.uuid).set(data, function(err) {
              if(!err) {
                console.log('saved user');
                resp.send({message: 'User created', response: data});
              }
            })
          }
         })
        }
      });

    });

  });


};
