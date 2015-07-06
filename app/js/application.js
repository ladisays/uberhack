// defining modules
angular.module('uberhack.controllers', []);
angular.module('uberhack.services', []);

/* loading services */
require('./services/auth.js');
require('./services/refs.js');
require('./services/user.js');


// loading controller
require('./controllers/mainCtrl.js');

window.Uberhack = angular.module('Uberhack', [
	'ngRoute',
	'ngCookies',
	'firebase',
	'uberhack.controllers',
	'uberhack.services'
]);

uberhack.config(['$routeProvider','$locationProvider',
	function($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider
			.when('/', {
				templateUrl: 'views/home.html',
				controller: 'mainCtrl'
			})
			.otherwise({
				templateUrl: '404.html'
			});
	}]);

uberhack.run(['$rootScope', 'Authentication', 'Refs',
  function($rootScope, Authentication, Refs) {
  	Refs.root.onAuth(function(authData) {
  		if(authData) {
  			var user = {
          uid: authData.uid,
          name: authData.google.displayName,
          email: authData.google.email,
          accessToken: authData.google.accessToken,
          picture: authData.google.cachedUserProfile.picture
        };
  			$rootScope.currentUser = user;
  			return $rootScope.currentUser;
  		}
      else {
      	Authentication.logout();
      }
    });
  }]);