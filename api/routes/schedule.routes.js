var Firebase = require('firebase');
var needle = require('needle');
var _ = require('lodash');
var schedule = require('node-schedule');


module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl);
  var requestsRef = root.child('requests');

  requestsRef.on('child_added', function(snap) {
    if (snap.val()) {
      console.log(snap.val());
    }
  });

  var date = new Date(2016, 12, 21, 5, 30, 0);
  var j = schedule.scheduleJob(date, function() {
    console.log('The world is going to end today.');
  });
};
