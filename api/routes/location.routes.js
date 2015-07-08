var geocoder = require('geocoder');

module.exports = function(app, config) {
  app.route('/location')
    .post(function(req, res) {
      var longitude = req.query.longitude;
      var latitude = req.query.latitude;
      // Reverse Geocoding
      geocoder.reverseGeocode(latitude, longitude, function(err, data) {
        if (err) {
          console.log(err);
          return;
        }
        data.results.forEach(function(e, i) {
          e.address_components.forEach(function(e, i) {
            return res.json(e.long_name);
          });
        });
      });
    });
};
