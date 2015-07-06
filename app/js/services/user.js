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
