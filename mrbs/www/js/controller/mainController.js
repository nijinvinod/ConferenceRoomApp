var confapp = angular.module('confapp', ['ngRoute','ngIdle']);

confapp.controller("outputController",['$scope','$timeout','$http','$location','$interval', displayCtrl.outputController]);
confapp.controller("inputController",['$scope', '$http','$timeout','$idle', '$location', editCtrl.inputController]);
confapp.controller("prefController",['$scope','$http','$location', prefCtrl.prefController]);

confapp.config(function ($routeProvider){
	$routeProvider
	.when('/home',{
		controller: 'outputController',
		templateUrl: 'pages/displayView.html'
	})
	.when('/edit',{
		controller: 'inputController',
		templateUrl: 'pages/editView.html'
	})
	.when('/pref',{
		controller: 'prefController',
		templateUrl: 'pages/preferences.html'
	})
	.otherwise({redirectTo:'/home'});
});

confapp.config(function($idleProvider, $keepaliveProvider) {
	$idleProvider.idleDuration(20);
	$idleProvider.warningDuration(20);
	$keepaliveProvider.interval(10);
});

confapp.run(function($rootScope, $idle, $log, $keepalive){
	$idle.watch();

	$log.debug('app started.');
});

confapp.controller("clockController", function($scope, $interval){
	
	$scope.clock = checkTime(new Date().getHours()) + ":" + checkTime(new Date().getMinutes());
	$scope.date = getDate();

	var days = []

	function startTime() {
		var today = new Date();
		var h = today.getHours();
		var m = today.getMinutes();
		var s = today.getSeconds();
		m = checkTime(m);
		s = checkTime(s);
		// Checking for length of hours
		h = h+"";
		if(h.length == 1){
			h = "0"+h;
		}
		//Update Clock
		$scope.clock = h+":"+m;
		getDate();
	}

	function getDate(){
		var localDate = new Date().toString().split(" ");
		return localDate[0]+", "+localDate[2]+" "+localDate[1];
	}

	$interval(function(){
		startTime();
	},1000);
	
	function checkTime(i) {
		if (i<10) {i = "0" + i};  // add zero in front of numbers < 10
		return i;
	}
});