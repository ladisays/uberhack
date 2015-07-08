var users = require('./users.routes');
var calendar = require('./calendar.routes');
var requests = require('./requests.routes');

module.exports = function(app, config) {
  users(app, config);
  calendar(app, config);
  requests(app, config);
};
