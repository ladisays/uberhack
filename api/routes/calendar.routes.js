var Firebase = require('firebase'),
  needle = require('needle'),
  google = require('googleapis'),
  googleAuth = require('google-auth-library'),
  _ = require('lodash');

module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl),
    auth = new googleAuth(),
    oAuthClient = new auth.OAuth2(config.calendar.clientId, config.calendar.clientSecret, config.calendar.callBackURL),
    authed = false;

  app.route('/calendar')
    .get(function(req, res) {
      if (!authed) {
        var url = oAuthClient.generateAuthUrl({
          access_type: 'offline',
          scope: 'https://www.googleapis.com/auth/calendar.readonly'
        });
        res.redirect(url);
      } else {
        var calendar = google.calendar('v3');
        calendar.events.list({
          calendarId: 'primary',
          maxResults: 10,
          timeMin: (new Date()).toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          auth: oAuthClient
        }, function(err, response) {
          if (err) {
            console.log('The API returned an error: ' + err);
            return;
          }
          var events = response.items;
          if (events.length === 0) {
            console.log('No upcoming events found.');
            return res.json({
              err: 'No upcoming events found.'
            });
          } else {
            console.log('Upcoming 10 events: ', events);
            var selectedEvents = [];
            for (var i = 0; i < events.length; i++) {
              var event = events[i],
                eventDetails = {};
              eventDetails.start = event.start.dateTime || event.start.date;
              eventDetails.end = event.end.dateTime || event.end.date;
              eventDetails.status = event.status;
              eventDetails.location = event.location;
              eventDetails.organiser = event.organiser;
              eventDetails.summary = event.summary;
              selectedEvents.push(eventDetails);
            }
            return res.json(selectedEvents);
          }
        });
      }
    });

  app.route('/calendar/callback')
    .get(function(req, res) {
      var code = req.query.code;
      oAuthClient.getToken(code, function(err, tokens) {
        if (err) {
          console.log('Error authenticating');
          console.log(err);
        } else {
          console.log('Successfully authenticated');
          console.log(tokens);
          oAuthClient.setCredentials(tokens);
          authed = true;
          res.redirect('/calendar');
        }
      });
    });

  app.route('/user/:uid/calendar')
    .post(function(req, res) {
      var uid = req.params.uid;
      var body = req.body.calendar;
      var JSONObj = JSON.parse(body);
      console.log(uid, 'string', body, "JSON", JSONObj);
      root.child('users').child(uid).set(body, function(err) {
        if (!err) {
          return res.json({response: 'Successfully saved calendar'});
        }
      });
    });

  app.route('/calendar')
    .post(function(req, res) {
      var access_token = req.body.access_token;
      var calendar = google.calendar('v3');
      calendar.events.list({
        calendarId: 'primary',
        maxResults: 10,
        timeMin: (new Date()).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        auth: access_token
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        var events = response.items;
        if (events.length === 0) {
          console.log('No upcoming events found.');
          return res.json({
            err: 'No upcoming events found.'
          });
        } else {
          console.log('Upcoming 10 events: ', events);
          var selectedEvents = [];
          for (var i = 0; i < events.length; i++) {
            var event = events[i],
              eventDetails = {};
            eventDetails.start = event.start.dateTime || event.start.date;
            eventDetails.end = event.end.dateTime || event.end.date;
            eventDetails.status = event.status;
            eventDetails.location = event.location;
            eventDetails.organiser = event.organiser;
            eventDetails.summary = event.summary;
            selectedEvents.push(eventDetails);
          }
          return res.json(selectedEvents);
        }
      });
    });
};
