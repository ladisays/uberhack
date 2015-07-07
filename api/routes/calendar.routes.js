var Firebase = require('firebase'),
  needle = require('needle'),
  google = require('googleapis'),
  googleAuth = require('google-auth-library');
_ = require('lodash');

module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl),
    auth = new googleAuth(),
    oAuthClient = new auth.OAuth2(config.calendar.clientId, config.calendar.clientSecret, config.calendar.callBackURL);

  app.route('/calendar')
    .get(function(req, res) {
      var url = oAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
      });
      res.redirect(url);
    });

  app.route('/calendar/callback')
    .get(function(req, res) {
      var code = req.param('code');
      oAuthClient.getToken(code, function(err, tokens) {
        if (err) {
          console.log('Error authenticating');
          console.log(err);
        } else {
          console.log('Successfully authenticated');
          console.log(tokens);
          // Store our credentials and redirect back to our main page
          oAuthClient.setCredentials(tokens);
          res.redirect('/calendar/process');
        }
      });
    });

  app.route('/calendar/process')
    .get(function(req, res) {
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
        // console.log(response);
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
