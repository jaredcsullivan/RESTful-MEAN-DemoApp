angular.module('angularApp', ['ui.router', 'ui.bootstrap', 'xeditable'])

.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('main', {
            url: '/main',
            templateUrl: '/main.html',
            controller: 'MainCtrl',
			onEnter: ['$state', 'auth', 'items', 'subitems', function($state, auth, items, subitems){
                if(!auth.isLoggedIn()){
                    $state.go('home');
                } else {
					return items.getAll();
				}
            }]
        })
		.state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                    $state.go('main');
                }
            }]
        })
        .state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                    $state.go('main');
                }
            }]
        })
        .state('forgot', {
            url: '/forgot',
            templateUrl: '/forgot.html',
            controller: 'AuthCtrl',
             onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                    $state.go('main');
                }
            }]
        })
	    .state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'HomeCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                    $state.go('main');
                }
            }]
        })
	
	 $urlRouterProvider.otherwise('home'); 
}])

.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};
        
    auth.saveToken = function (token){
        $window.localStorage['demo-token'] = token;
    };

    auth.getToken = function (){
        return $window.localStorage['demo-token'];
    };
    
    auth.isLoggedIn = function(){
        var token = auth.getToken();

        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    
    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };
    
     auth.forgot = function(user){
        return $http.post('/forgot', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
     
     auth.resetPassword = function(emailToken){
        return $http.post('/reset/' + emailToken).success(function(data){
            auth.saveToken(data.token);
        });
    };
        
    auth.register = function(user){
        return $http.post('/register', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    
    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    
    auth.removeCookie = function() {
        $window.localStorage.removeItem('demo-token');
    };
    
    auth.logOut = function(){
        $window.localStorage.removeItem('demo-token');
         var str = $window.location + '';
         var loc = str.split("#");
        
       $window.location = loc[0];
    };

    return auth;
    
}])

.factory('items', ['$http', 'auth', function($http, auth){
    var o = {
        items: []
    };
    
    o.getAll = function() {
        return $http.get('/items', {
        headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
            angular.copy(data, o.items);
        });
    };
    
    o.create = function(item) {
        return $http.post('/items', item, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.items.push(data);
        });
    }; 
	
	o.update = function(item) {
        return $http.put('/items/' + item._id, item, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
        });
    }; 
	
	o.delete = function(id) {
        return $http.delete('/items/'+ id, {
        	headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
        });
    };
	
	o.addSubitem = function(id, subitem) {
  		return $http.post('/items/' + id + '/subitems', subitem, {
    		headers: {Authorization: 'Bearer '+auth.getToken()}
  		}).success(function(data){
        });
	};
   
    return o;
    
}])

.factory('subitems', ['$http', 'auth', function($http, auth){
    var o = {
        subitems: []
    };
	
	o.get = function(id) {
        return $http.get('/subitems/' + id, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
    }).then(function(res){
            return res.data;
        });
    };
	
    o.getSubitems = function(itemId) {
        return $http.get('/items/' + itemId + '/subitems', {
            headers: {Authorization: 'Bearer '+auth.getToken()}
    }).then(function(res){
            return res.data;
        });
    };
    
    o.create = function(subitem) {
        return $http.post('/items/' + subitem.itemId + '/subitems', subitem, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).then(function(res){
            return res.data;
        });
    }; 
	
	o.update = function(subitem) {
        return $http.put('/items/' + subitem.itemId + '/subitems', subitem, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
       });
    }; 
	
	o.delete = function(subitemId) {
        return $http.delete('/items/'+ subitemId + '/subitems', {
        	headers: {Authorization: 'Bearer '+auth.getToken()}
    	}).success(function(data){
       });
    };
   
    return o;
    
}])

.controller('MainCtrl', [
'$scope',
'$http',
'$window',
'auth',
'items',
'subitems',
 function($scope, $http, $window, auth, items, subitems){

     $scope.isLoggedIn = auth.isLoggedIn;
     
     $scope.currentUser = auth.currentUser;
	 
	 $scope.subitemData = {};
     
     $scope.items = items.items;
     
     $scope.editAllBtn = false;
	 	 	 
	 $scope.addItem = function(){
  		if(!$scope.itemName || $scope.itemName === '') { return; }
  		items.create({
    		itemName: $scope.itemName,
  		});
		$scope.itemName = '';
	 }
		 
	 $scope.editItemName = function($data, item){
		item.itemName = $data;
		items.update(item);
	 };
	 
	 $scope.deleteItem = function(item){
		var index = $scope.items.indexOf(item);
		 
		$scope.items.splice(index, 1);     
        items.delete(item._id);
     };
	 
	 $scope.getSubitems = function(id) {
      $http.get('/items/'+ id +'/subitems', {
            headers: {Authorization: 'Bearer '+auth.getToken()}
    	}).success(function(data) { 
            	$scope.subitems = data;
		  }).error(function(data) {
	  		}); 
     }; 
	 
	 $scope.addSubitem = function(id){
		if(!$scope.subitemData.subitemName || $scope.subitemData.subitemName === '') { return; }
  		items.addSubitem(id, {
    		subitemName: $scope.subitemData.subitemName,
			author: auth.currentUser,
  		}).success(function(subitem) {
			$scope.subitems = $scope.getSubitems(id);
  		});
  		$scope.subitemData.subitemName = '';
	 };
	 
	 $scope.editSubitemName = function($data, subitem){
		subitem.subitemName = $data;
		subitems.update(subitem).success(function(subitem) {
			$scope.subitems = $scope.getSubitems(subitem.itemId);
  		});
	 };

     $scope.makeImportant = function(item) {
		item.important = !item.important
		items.update(item);
     };

     $scope.makeDone = function(subitem) {
		subitem.done = !subitem.done;
		subitems.update(subitem);
     };
	 
	 $scope.deleteSubitem = function(id) {
		 subitems.delete(id);
	 };
}]) 

.controller('AuthCtrl', [
'$scope',
'$state',
'$window',
'auth',
function($scope, $state, $window, auth){
  $scope.user = {};
    
  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('main');
    });
  };
    
  $scope.reset = function() {
    auth.reset($scope.user);
  };

  $scope.logIn = function(){
    $scope.user.username.toLowerCase();
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('main');
    });
  };
    
  $scope.forgot = function(){
	auth.forgot($scope.user).success(function(data){
		$scope.success = data;
	}).error(function(error){
		$scope.error = error;
	}).then(function(){
		window.localStorage.removeItem('demo-token');
	});
  };
}]) 

.controller('NavCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
    
  $scope.isLoggedIn =  auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}])

.controller('HomeCtrl', [
'$scope',
'auth',
 function($scope, auth){
     
     $scope.isLoggedIn = auth.isLoggedIn;
     
 }])

.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});