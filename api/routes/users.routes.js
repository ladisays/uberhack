var Firebase = require('firebase');
var needle       = require('needle');
var _            = require('lodash');
var OAuth        = require('oauth');
var requests     = require('request')

module.exports = function(app, config) {

  var root = new Firebase(config.firebase.rootRefUrl);

  var OAuth2 = OAuth.OAuth2;

  var oauth2 = new OAuth2(
    config.uber.clientId,
    config.secretKey,
    "uberhack",
    config.uber.authorize_url,
    config.uber.access_token_url,
    config.uber.base_uber_url
  )

  parameters = {
    'response_type': 'code',
    'redirect_uri': config.uber.redirect_url,
    'scope': 'profile'
  }

  login_url = oauth2.getAuthorizeUrl(parameters)

};
