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
