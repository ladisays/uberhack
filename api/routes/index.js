var users = require('./users.routes'),
  calendar = require('./calendar.routes'),
  requests = require('./requests.routes'),
  shared = require('./shared.routes');
location = require('./location.routes');

module.exports = function(app, config) {
  users(app, config);
  calendar(app, config);
  requests(app, config);
  location(app, config);
  shared(app, config);
};
