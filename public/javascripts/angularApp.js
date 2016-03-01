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
			onEnter: ['$state', 'auth', 'todos', 'items', function($state, auth, todos, items){
                if(!auth.isLoggedIn()){
                    $state.go('home');
                } else {
					return todos.getAll();
				}
            }]
		  	/*resolve: {
    			todoPromise: ['todos', function(todos) {
					return todos.getAll();
    			}]
  			}*/
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
	
	//TODO ADD: GUEST STATE
	
	 $urlRouterProvider.otherwise('home'); 
}])

.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};
        
    auth.saveToken = function (token){
        $window.localStorage['vogo-token'] = token;
    };

    auth.getToken = function (){
        return $window.localStorage['vogo-token'];
    }
    
    auth.isLoggedIn = function(){
        var token = auth.getToken();

        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    }
    
    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    }
    
    auth.getFname = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.fname;
        }
    }
        
    auth.getLname = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.lname;
        }
    }
    
    auth.getEmail = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.email;
        }
    }
        
    auth.register = function(user){
        return $http.post('/users/register', user).success(function(data){
            auth.saveToken(data.token);
        });
    }
    
    auth.logIn = function(user){
        return $http.post('/users/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    }
    
    auth.logOut = function(){
        $window.localStorage.removeItem('vogo-token');
         var str = $window.location + '';
         var loc = str.split("#");
        
         //Print URL to console for string split
         console.log(loc[0]);
         console.log(loc[1]);
        
       $window.location = loc[0];
    }

    return auth;
    
}])

.factory('todos', ['$http', 'auth', function($http, auth){
    var o = {
        todos: []
    };
    
    o.getAll = function() {
        return $http.get('/todos', {
        headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
            angular.copy(data, o.todos);
        });
    };
    
    o.create = function(todo) {
        return $http.post('/todos', todo, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.todos.push(data);
        });
    }; 
	
	o.update = function(todo) {
        return $http.put('/todos/' + todo._id, todo, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
			//console.log(data);
        });
    }; 
	
	o.delete = function(id) {
        return $http.delete('/todos/'+ id, {
        	headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
			//console.log(data);
        });
    };
	
	o.addItem = function(id, item) {
  		return $http.post('/todos/' + id + '/items', item, {
    		headers: {Authorization: 'Bearer '+auth.getToken()}
  		}).success(function(data){
			//console.log(data);
        });
	};
   
    return o;
    
}])

.factory('items', ['$http', 'auth', function($http, auth){
    var o = {
        items: []
    };
	
	o.get = function(id) {
        return $http.get('/items/' + id, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
    }).then(function(res){
            return res.data;
        });
    };
	
    o.getItems = function(todoId) {
        return $http.get('/todos/' + todoId + '/items', {
            headers: {Authorization: 'Bearer '+auth.getToken()}
    }).then(function(res){
            return res.data;
        });
    };
    
    o.create = function(item) {
        return $http.post('/todos/' + item.todoId + '/items', item, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).then(function(res){
            return res.data;
        });
    }; 
	
	o.update = function(item) {
        return $http.put('/todos/' + item.todoId + '/items', item, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
			//console.log(data);
        });
    }; 
	
	o.delete = function(itemId) {
        return $http.delete('/todos/'+ itemId + '/items', {
        	headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
			//o.todos.splice(data);
        });
    };
   
    return o;
    
}])

.controller('MainCtrl', [
'$scope',
'$http',
'auth',
'todos',
'items',
 function($scope, $http, auth, todos, items){

     $scope.isLoggedIn = auth.isLoggedIn;
     
     $scope.currentUser = auth.currentUser;
     
     $scope.getFname = auth.getFname;

     $scope.getLname = auth.getLname;

     $scope.getEmail = auth.getEmail;
	 
	 $scope.itemData = {};
     
     $scope.todos = todos.todos;
	 	 	 
	 $scope.addTodo = function(){
  		if(!$scope.todoName || $scope.todoName === '') { return; }
  		todos.create({
    		todoName: $scope.todoName,
  		});
		$scope.todoName = '';
	 }
		 
	 $scope.editTodoName = function($data, todo){
		todo.todoName = $data;
		todos.update(todo);
	 };
	 
	 $scope.deleteTodo = function(todo){
		var index = $scope.todos.indexOf(todo);
		 
		$scope.todos.splice(index, 1);     
        todos.delete(todo._id);
     };
	 
	 $scope.getItems = function(id) {
      $http.get('/todos/'+ id +'/items', {
            headers: {Authorization: 'Bearer '+auth.getToken()}
    	}).success(function(data) { 
            	$scope.items = data;
		  
		  }).error(function(data) {
				console.log('Error: ' + data);
	  		}); 
     }; 
	 
	 $scope.addItem = function(id){
		if(!$scope.itemData.itemName || $scope.itemData.itemName === '') { return; }
  		todos.addItem(id, {
    		itemName: $scope.itemData.itemName,
			author: auth.currentUser,
  		}).success(function(item) {
			$scope.items = $scope.getItems(id);
  		});
  		$scope.itemData.itemName = '';
	 };
	 
	 $scope.editItemName = function($data, item){
		 console.log($data);
		 console.log(item);
		item.itemName = $data;
		items.update(item).success(function(item) {
			$scope.items = $scope.getItems(item.todoId);
  		});
	 };
	 
	 $scope.deleteItem = function(id) {
		 items.delete(id);
	 };

}]) 

.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
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
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('main');
    });
  };
}]) 

.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}])

.controller('HomeCtrl', [
'$scope',
'auth',
 function($scope, auth){
     
     $scope.isLoggedIn = auth.isLoggedIn;
     //$scope.currentUser = auth.currentUser;
     
 }])

.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});