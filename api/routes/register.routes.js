var Firebase = require('firebase'),
  _ = require('lodash'),
  http = require('http'),
  querystring = require('querystring');

module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl);
};
