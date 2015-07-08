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

  app.route('/:uid/calendar')
    .get(function(req, res) {
      uid = req.params.uid;
      console.log(uid);
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
            console.log('Upcoming 10 events: ');
            var selectedEvents = [];
            for (var i = 0; i < events.length; i++) {
              var event = events[i],
                eventDetails = {
                  start: event.start.dateTime ? event.start.dateTime : "1",
                  end: event.end.dateTime ? event.end.dateTime : "1",
                  status: event.status ? event.status : "1",
                  location: event.location ? event.location : "1",
                  organiser: event.organiser ? event.organiser : "1",
                  summary: event.summary ? event.summary : "1"
                };
              selectedEvents.push(eventDetails);
            }
            console.log(selectedEvents, "uid", uid);
            root.child("calendars").child(uid).set(selectedEvents, function(err) {
              if (!err) {
                return res.json(selectedEvents);
              }
            });
          }
        });
      }
    });

  app.route('/calendar/callback')
    .get(function(req, res) {
      var code = req.query.code;
      oAuthClient.getToken(code, function(err, tokens) {
        if (err) {
          console.log('Error authenticating', err);
        } else {
          console.log('Successfully authenticated', tokens);
          oAuthClient.setCredentials(tokens);
          authed = true;
          res.redirect('/' + uid + '/calendar');
        }
      });
    });
};
