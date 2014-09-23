var displayCtrl = {};

var roomStatusPath = "/CalendarServlet?action=roomdetails";
var subscribeDevicePath = "/CalendarServlet?action=subscribe";

displayCtrl.outputController = function($scope, $timeout, $http,  $location, $interval){
	$scope.roomDetails = {};
	$scope.panelStatus = mrbsGlobals.roomStatus;
	$scope.rooms = [];
	$scope.nextEventName = '';
	
	var roomDataLoaded = false;
	var refreshAction = false;
	 
	/* Method:: Register Device Subscription to Server **/
	$scope.registerDeviceSubs = function(){
		$http({
				method: 'POST', 
				url:mrbsGlobals.protocol+mrbsGlobals.server+subscribeDevicePath,
				headers: {'Content-Type': 'application/json'},
				timeout: mrbsGlobals.timeoutPeriod,
				data: {
					regId: mrbsGlobals.subscriptionId
				}
			}).
		    success(function(result, status, headers, config) {
		    	
		    }).
		    error(function(data, status, headers, config) {
		    	alert("Cannot register device for Notification! Restart Application");
		    });
	};

	// Method:: Action on recv. Notifications from Server 
	$scope.recvNotifications = function(){
		console.log("Processing Notifications");
		if(mrbsGlobals.server != undefined && mrbsGlobals.roomName != undefined){
			refreshAction = true;
			$scope.getRoomDetails();
		}
	};

	/* Method:: Get Room Details */
	$scope.getRoomDetails = function(){
		if(refreshAction==false){
			$scope.ajaxData = false;
			$scope.networkErrorData = false;
		}
		$http({
			method: 'POST', 
			url:mrbsGlobals.protocol+mrbsGlobals.server+roomStatusPath,
			cache: true,
			timeout: mrbsGlobals.timeoutPeriod
		}).
	    success(function(result, status, headers, config) {
	    	$scope.ajaxData = true;
	    	$scope.networkErrorData = false;
	    	if(result!=undefined){
	    		var data = result.data;
	    		for(var i=0;i<data.length;i++){
	    			if(data[i].name==$scope.roomName){
	    				$scope.roomDetails = {};

	    				if(data[i].status=="Available"){
	    					mrbsGlobals.roomDetails.panelStatus = "panelAvailable";
	    				}else{
	    					mrbsGlobals.roomDetails.panelStatus = "panelBlocked";
	    				}
	    				mrbsGlobals.roomDetails.tillTime = data[i].nextEventTime;
	    				if(mrbsGlobals.roomDetails.tillTime != "EOD"){
	    					mrbsGlobals.roomDetails.tillTime = mrbsGlobals.roomDetails.tillTime.slice(11,16);
	    				}
	    				if(data[i].nextEvent!=undefined){
		    				mrbsGlobals.roomDetails.nextEventName = data[i].nextEvent.title;
		    				mrbsGlobals.roomDetails.nextEventTime = data[i].nextEvent.start.slice(11,16)+"-"+data[i].nextEvent.end.slice(11,16);
		    				mrbsGlobals.roomDetails.nextEventOwner = mrbsGlobals.getOwner(data[i].nextEvent.organizer);
	    				}else{
	    					mrbsGlobals.roomDetails.nextEventName = "";
	    				}
	    				
	    				if(data[i].currentEvent!=undefined){
		    				mrbsGlobals.roomDetails.currentEventName = data[i].currentEvent.title;
		    				mrbsGlobals.roomDetails.currentEventTime = data[i].currentEvent.start.slice(11,16)+"-"+data[i].currentEvent.end.slice(11,16);
		    				mrbsGlobals.roomDetails.currentEventOwner = mrbsGlobals.getOwner(data[i].currentEvent.organizer);
	    				}
	    				$scope.roomDetails = mrbsGlobals.roomDetails;
	    				refreshAction=false;
	    			}
	    		}
	    	}
	    }).
	    error(function(data, status, headers, config) {
	    	$scope.ajaxData = true;
	    	$scope.networkErrorData = true;
	    	refreshAction=false;
	    });
	};
	

	$scope.checkPreferences = function() {	
		function queryPref(tx) {
		    tx.executeSql('SELECT * FROM PREFERENCES', [], querySuccess, queryError);
		}
		function querySuccess(tx, results) {
			if(results.rows.item(0).prefvalue == null){
				$scope.serverPref = "false";
			}
			else{
				mrbsGlobals.server = results.rows.item(0).prefvalue.toString();
				mrbsGlobals.roomName = results.rows.item(1).prefvalue.toString();
				
				$scope.showDisplayView();
				$scope.$apply();
			}
		}
		function queryError(err) {
		    console.log("Error checking Preferences: "+err.code);
		}
		
		mrbsGlobals.db.transaction(queryPref, queryError);
	};
	
	$scope.showDisplayView = function(){
		$scope.serverPref = "true";
		$scope.roomName = mrbsGlobals.roomName;
		if(mrbsGlobals.isRegistered == false){
			mrbsGlobals.isRegistered = true;
			$scope.registerDeviceSubs();
		}
		$scope.getRoomDetails();
	};
	
	$scope.showSettings = function(){
		$scope.serverPref = "false";
		$scope.serverMessage = "";
		$scope.serverUrlPref = mrbsGlobals.server;
		$scope.roomNamePref = mrbsGlobals.roomName;
	};
	
	$scope.savePref = function(){	
		var serverPath = "/CheckServerServlet";
		$scope.serverMessage = "Verifying Server and Room";

		if($scope.serverUrlPref == "" || $scope.roomNamePref == ""){
			$scope.serverMessage = "All fields are mandatory";
			return;
		}
		var myurl = "http://"+$scope.serverUrlPref+serverPath;
		$http({
			method: 'POST', 
			url: myurl,
			timeout: mrbsGlobals.timeoutPeriod,
			data: {
				roomName: $scope.roomNamePref
			}
		}).
	    success(function(result, status, headers, config) {
	    	$scope.ajaxData = true;
	    	if(result=="200"){
	    		$scope.savePrefToDB();
	    		$scope.serverMessage = "";
	    	}else{
	    		$scope.serverMessage = "Sorry, Room not found!";
	    	}
	    }).
	    error(function(data, status, headers, config) {
	    	$scope.serverMessage = "Sorry, couldn't connect to Server";
	    });
	};
	$scope.savePrefToDB = function(){	
		function updatePrefIntoDB(tx) {
			tx.executeSql('UPDATE PREFERENCES SET prefvalue = "'+$scope.serverUrlPref+'" WHERE prefkey = "server"');
			tx.executeSql('UPDATE PREFERENCES SET prefvalue = "'+$scope.roomNamePref+'" WHERE prefkey = "roomName"');
		}
		function updateSuccess(tx, results) {
		
			mrbsGlobals.server = $scope.serverUrlPref;
			mrbsGlobals.roomName = $scope.roomNamePref;
			$scope.showDisplayView();
			$scope.$apply();
		}
		function errorDB(err) {
		    $scope.serverMessage = "Error Saving Prefernces to DB. Retry";
		}
		
		mrbsGlobals.db.transaction(updatePrefIntoDB, errorDB, updateSuccess);
	};
	
	$scope.cancelPref = function(){
		if(mrbsGlobals.server != undefined && mrbsGlobals.roomName != undefined){
			$scope.serverPref = "true";
		}
	};
	
	if(mrbsGlobals.server == undefined && mrbsGlobals.roomName == undefined){
		$scope.checkPreferences();
	}
	else{
		$scope.showDisplayView();
	}
};