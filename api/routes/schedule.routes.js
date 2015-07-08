var Firebase = require('firebase');
var needle = require('needle');
var _ = require('lodash');
var schedule = require('node-schedule');


module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl);
  var requestsRef = root.child('requests');

  requestsRef.on('child_added', function(snap) {
    if (snap.val()) {
      console.log('ghjgjfgh', snap.val());
      var value = snap.val();
      _.find(value, function(key) {
        var j = schedule.scheduleJob(key.date, function() {
          console.log('The world is going to end today.');
        });
      });
    }
  });
};
