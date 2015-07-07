var register_team = require('./register.routes.js');
var users = require('./users.routes');
var calendar = require('./calendar.routes');
module.exports = function(app, config) {
  register_team(app, config);
  users(app, config);
  calendar(app, config);
};
