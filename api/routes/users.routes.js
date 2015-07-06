var Firebase = require('firebase'),
needle = require('needle');
_ = require('lodash');

module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl);
};
