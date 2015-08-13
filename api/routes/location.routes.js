var geocoder = require('geocoder');

module.exports = function (app, config) {
  app.route('/location')
    .get(function (req, res) {
      var longitude = req.query.lng;
      var latitude = req.query.lat;
      var street = req.query.street;
      var options = { sensor: true };

      if (longitude && latitude) {
        // Reverse Geocoding
        geocoder.reverseGeocode(latitude, longitude, function (err, data) {
          if (err) {
            console.log(err);
            res.json({ error: err });
          }
          // respond with an object containing a string
          // of the actual street address of the supplied co-ordinates
          res.json({ response: data.results[0].formatted_address });
        }, options);
      }

      if (street) {
        // Geocoding
        geocoder.geocode(street, function (err, data) {
          if (err) {
            console.log(err);
            res.json({ error: err });
          }
          // respond with a location object containing actual co-ordinates
          res.json({ response: data.results[0].geometry.location });
        }, options);
      }
    });
};
