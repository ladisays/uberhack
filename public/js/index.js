(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./controllers/mainCtrl.js":2,"./services/auth.js":3,"./services/refs.js":4,"./services/user.js":5}],2:[function(require,module,exports){
angular.module('uberhack.controllers')
.controller('mainCtrl', ['Authentication', '$scope', '$rootScope', '$location',
	function(Authentication, $scope, $rootScope, $location) {

	}
]);

},{}],3:[function(require,module,exports){
angular.module('uberhack.services')
  .factory('Authentication', ['$timeout', '$cookies', '$http', '$rootScope', 'Refs',
    function($timeout, $cookies, $http, $rootScope, Refs) {
      return {
        login: function(cb) {
          var self = this, options = { remember: true, scope: "email" };
          Refs.root.authWithOAuthPopup("google", function(error, authData) {
            if(cb) cb(error, authData);

            var user = {
              uid: authData.uid,
              name: authData.google.displayName,
              email: authData.google.email,
              accessToken: authData.google.accessToken,
              picture: authData.google.cachedUserProfile.picture
            };

            $http.post('/users', user)
              .success(function(data){
                // console.log(data);
                $timeout(function() {
                  self.user = data;
                });
                Materialize.toast('You have successfully logged in!', 5000, 'teal accent-4');
                return;
              })
              .error(function(error) {
                console.log(error);
              });
          }, options);
        },

        logout: function() {
          Refs.root.unauth();
          $rootScope.currentUser = null;
        }
      };
    }
  ]);

},{}],4:[function(require,module,exports){
angular.module('uberhack.services')
  .factory('Refs', ['$cookies', '$firebase',
    function($cookies, $firebase) {
      var rootRef = new Firebase($cookies.rootRef || 'YOUR_FIREBASE_URL');     
      
      // define every standard ref used application wide
      return {
        root: rootRef,
        users: rootRef.child('users')
      };
    }
  ]);

},{}],5:[function(require,module,exports){
angular.module('uberhack.services')
  .factory('UserDetails', ['$cookies', '$firebaseObject', 'Refs',
    function($cookies, $firebaseObject, Refs) {  
      
      var userProfile = function(uid) {
        var user = $firebaseObject(Refs.users.child(uid));
        return user;
      };

      return {
        profile: userProfile
      };
    }
  ]);

},{}]},{},[1]);
