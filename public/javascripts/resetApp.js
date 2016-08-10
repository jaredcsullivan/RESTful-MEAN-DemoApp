angular.module('resetApp', [])

.controller('ResetCtrl', [
	'$scope',
    '$http', 
    '$window',
function($scope, $http, $window){
	
	 var str = $window.location.pathname;
	 var str1 = str.substr(7, str.length);

     $scope.reset = function (){
		 $http.post('/confirmreset/', {
			 password : $scope.password,
		 	 password2 : $scope.password2,
		 	 resetPasswordToken : str1}).error(function(error){
      			$scope.error = error;
    			}).success(function(){
			    	$window.location = $window.location.origin + "/#/login";
		 		});
	 };
     
}]);