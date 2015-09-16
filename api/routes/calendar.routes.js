var Firebase = require('firebase'),
  needle = require('needle'),
  google = require('googleapis'),
  googleAuth = require('google-auth-library'),
  _ = require('lodash'),
  request = require('request'),
  moment = require('moment');

module.exports = function(app, config) {
  var root = new Firebase(config.firebase.rootRefUrl),
      calendarRef = root.child('calendars'),
      auth = new googleAuth(),
      oAuthClient = new auth.OAuth2(config.calendar.clientId, config.calendar.clientSecret, config.calendar.callBackURL),
      authed = false;

  app.route('/:uid/calendar')
    .post(function(req, res) {
      var uid = req.params.uid;
      var tokens = {
        accessToken: req.body.accessToken,
        refreshToken: req.body.refreshToken
      };

      calendarRef.child(uid).once('value', function (snap) {
        if (snap.val()) {
          console.log('User already has a calendar');
          data = snap.val();
          data = shortList(data.items);

          return res.json({ response: data });
        } else {
          var url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

          request.get(url, {
            auth: {'bearer': tokens.accessToken},
            qs: {
              access_type: 'offline',
              timeMin: moment.utc().format(),
              singleEvents: true,
              orderBy: 'startTime'
            }
          }, function (err, status, body) {
            if (err) {
              console.log('There is an error - ', err);
              res.json({ error: err });
            }

            body = JSON.parse(body);
            
            var data = {};
            data.items = buildEventsObject(body.items);

            if (!data.items) {
              return res.status(400).json({ error: 'Insufficient calendar details!' });
            }

            data.tokens = tokens;
            calendarRef.child(uid).set(data, function (err) {
              if (!err) {
                data = shortList(data.items);
                return res.json({ response: data });
              }
            });
          });
        }
      });
    });

  app.route('/:uid/calendar')
    .get(function (req, res) {
      var uid = req.params.uid;

      calendarRef.child(uid).once('value', function (snap) {
        if (snap.val()) {
          var data = snap.val();
          data = shortList(data.items);

          return res.json({ response: data });
        } else {
          return res.json({ error: 'User does not have a calendar!' });
        }
      })
    });

  function buildEventsObject(data) {
    var i, events = [], eventDetails;

    for (i = 0; i < data.length; i++) {
      eventDetails = {};
      if (data[i].start && data[i].end && data[i].location && data[i].summary) {
        eventDetails.start      = data[i].start.dateTime;
        eventDetails.end        = data[i].end.dateTime;
        eventDetails.status     = data[i].status;
        eventDetails.location   = data[i].location;
        eventDetails.summary    = data[i].summary;
        events.push(eventDetails);
      }
      else {
        return false;
      }
    }

    return events;
  }

  function shortList(data) {
    var i, arr = [],
        now = moment.utc().format(),
        tomorrow = moment().add(2, 'days').utc().format();

    for (i in data) {
      var time = moment(data[i].start);

      if (time.isBetween(now, tomorrow)) {
        arr.push(data[i]);
      }
    }

    return arr;
  }
};
