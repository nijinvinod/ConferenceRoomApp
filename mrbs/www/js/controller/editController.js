var editCtrl = {};

var todayEventPath = "/CalendarServlet?action=todayevent&room=";
var singleEventPath = "/CalendarServlet?action=newevent";
var roomDetailsPath = "/CalendarServlet?action=roomdetails";


/**--- Start of CONSTANTS -- */
var CREATING_EVENT_MSG = "Creating Event";
var ALL_FIELDS_NEEDED = "All fields are required";
var SERVER_NOT_AVAILABLE = "Check Internet/ Server Not Available currently";
var ROOM_BOOKED = "Room Successfully Booked";
var ROOM_ALREADY_BLOCKED = "Room is already blocked";

/**--- End of CONSTANTS -- */

function getTimeArray(){
	var timeSlot = ['12:00AM','12:30AM','01:00AM','01:30AM',
	                  '02:00AM','02:30AM','03:00AM','03:30AM',
	                  '04:00AM','04:30AM','05:00AM','05:30AM',
	                  '06:00AM','06:30AM','07:00AM','07:30AM',
	                  '08:00AM','08:30AM','09:00AM','09:30AM',
	                  '10:00AM','10:30AM','11:00AM','11:30AM',
	                  '12:00PM','12:30PM','01:00PM','01:30PM',
	                  '02:00PM','02:30PM','03:00PM','03:30PM',
	                  '04:00PM','04:30PM','05:00PM','05:30PM',
	                  '06:00PM','06:30PM','07:00PM','07:30PM',
	                  '08:00PM','08:30PM','09:00PM','09:30PM',
	                  '10:00PM','10:30PM','11:00PM','11:30PM'];
	return timeSlot;
}



editCtrl.inputController = function($scope,$http, $timeout, $idle, $location){
	$scope.roomName = mrbsGlobals.roomName;
	$scope.panelStatus = "panelEdit";
	$scope.avails = [];

	$scope.events = [];
	$scope.eventsSection = false;


	$scope.title = "";
    $scope.organizer = "";
    $scope.startDate = "";
    $scope.endDate = "";

	$scope.timeDictionary = [
		{time:'08:00', status:'available'},
		{time:'08:30', status:'available'},
		{time:'09:00', status:'available'},
		{time:'09:30', status:'available'},
		{time:'10:00', status:'available'},
		{time:'10:30', status:'available'},
		{time:'11:00', status:'available'},
		{time:'11:30', status:'available'},
		{time:'12:00', status:'available'},
		{time:'12:30', status:'available'},
		{time:'13:00', status:'available'},
		{time:'13:30', status:'available'},
		{time:'14:00', status:'available'},
		{time:'14:30', status:'available'},
		{time:'15:00', status:'available'},
		{time:'15:30', status:'available'},
		{time:'16:00', status:'available'},
		{time:'16:30', status:'available'},
		{time:'17:00', status:'available'},
		{time:'17:30', status:'available'},
		{time:'18:00', status:'available'},
		{time:'18:30', status:'available'},
		{time:'19:00', status:'available'},
		{time:'19:30', status:'available'},
		{time:'20:00', status:'available'},
		{time:'20:30', status:'available'},
		{time:'21:00', status:'available'},
		{time:'21:30', status:'available'},
		{time:'22:00', status:'available'},
	];
	
	$scope.menus = [
			{name: 'New Event', icon: 'notebook', section: 'createEvent'},
	        {name: 'Today', icon: 'calendar2', section: 'todaysEvent'},
	        {name: 'Rooms', icon: 'office', section: 'showRooms'}
        ];

    $scope.rooms = [];
	$scope.messageBoard = undefined;
	$scope.eventMessageBoard = undefined;
	$scope.createView = "create";
	
	/** Method to show custom Pop Up **/
	$scope.showPopUp = function(action, msg){
		if(action=="show"){
			$scope.messageBoard = "show";
			$scope.popUpMessage = msg;
		}else{
			$scope.messageBoard = undefined;
		}
	}
    /** Menus & Associated Functions **/
    $scope.selected = $scope.menus[0];				//default select tab on page load
    $scope.content = "createEvent";
	
    $scope.showView = function(menu){
		$scope.selected = menu;
		$scope.content = menu.section;
	};

	$scope.isSelected = function(menu) {
        return $scope.selected === menu;
    };
   
    $scope.triggerBaseCalls = function(menu){
    	$scope.showView(menu);
    	if($scope.createView == "result"){
    		$scope.newEvent();
    	}
    	$scope.createView = "create";
    	if(menu.section=="showRooms"){
    		$scope.getAllRoomDetails();
    	}
    	else if(menu.section=="todaysEvent"){
    		$scope.getTodayEvents();
    	}
    	else{
    		
    	}
    };
    
    /* Method to Validate Event before Submitting */
    $scope.validateEvent = function(){
    	var flag = 0;
    	if($scope.title.length==0){
    		flag++;
    	}
    	if($scope.organizer.length==0){
    		flag++;
    	}
    	if($scope.startDate.length==0){
    		flag++;
    	}
    	if($scope.endDate.length==0){
    		flag++;
    	}
    	if(flag > 0){
    		return false;
    	}
    	return true;
    };


    $scope.processSaveEventResponse = function(result, times){
    	$scope.eventMessageBoard = "show";
    	if(result == "200"){
    		$scope.eventMessageBoard = undefined;
			$scope.createView = "result";
		}else if(result == "202"){
			$scope.eventMessages = ROOM_ALREADY_BLOCKED;
		}
		else{
			$scope.eventMessages = result;
		}

		$timeout(function(){
			$scope.eventMessageBoard = undefined;
		}, 4000);
    };

    $scope.cancelEvent = function(){
    	$location.path("home");
    };
	/** Create Event **/
    $scope.saveEvent = function(){
    	var flag = $scope.validateEvent();
    	if(flag == true){
    		$scope.showPopUp('show',CREATING_EVENT_MSG);
	    	$http({
				method: 'POST', 
				url:mrbsGlobals.protocol+mrbsGlobals.server+singleEventPath,
				headers: {'Content-Type': 'application/json'},
				timeout: mrbsGlobals.timeoutPeriod,
				data: {
					title: $scope.title,
					organizer: $scope.organizer,
					desc:"From App",
					location:$scope.roomName,
					sdate: $scope.startDate,
					stime: $scope.startTime,
					edate: $scope.endDate,
					etime: $scope.endTime,
					all: "",
					repeat: "",
					repeatDays: "",
					untildate:""
				}
			}).
		    success(function(result, status, headers, config) {
		    	$scope.showPopUp('hide');
		    	if(result!=undefined){
		    		$scope.processSaveEventResponse(result.data, 4000);
		    	}
		    }).
		    error(function(data, status, headers, config) {
		    	$scope.showPopUp('hide');
		    	$scope.processSaveEventResponse(SERVER_NOT_AVAILABLE, 2000);
		    });
		}else{
			$scope.processSaveEventResponse("All fields are required", 2000);
		}
    };
  
  	$scope.newEvent = function(){
  		$scope.createView = "create";
  		$scope.title = "";
  		$scope.startDate = "";
  		$scope.startTime = "";
  		$scope.endDate = "";
  		$scope.endTime = "";
  	};

	
	/** Todays Event **/
	$scope.getTodayEvents = function(){
		console.log("Path:"+mrbsGlobals.protocol+mrbsGlobals.server+roomStatusPath+$scope.roomName);
		$scope.ajaxData = false;
		$scope.networkErrorData = false;
		$http({
			method: 'POST', 
			url:mrbsGlobals.protocol+mrbsGlobals.server+todayEventPath+$scope.roomName,
			cache: true,
			timeout: mrbsGlobals.timeoutPeriod
		}).
	    success(function(result, status, headers, config) {
	    	$scope.ajaxData = true;
	    	$scope.events = [];
	    	$scope.eventsSection = true;
	    	if(result!=undefined){
	    		var data = result.data;
	    		for(var i = 0;i < data.length ; i++){
	    			var todayevent = {};
	    			todayevent.title = data[i].title;
	    			todayevent.owner = mrbsGlobals.getOwner(data[i].organizer);
	    			todayevent.timings = data[i].start.slice(11,16)+"-"+data[i].end.slice(11,16);
	    			$scope.events.push(todayevent);
	    		}
	    		$scope.addTodayEvents();
	    		if($scope.events.length == 0){			//Empty Booking Message
	    			$scope.nobooking = "";
	    		}
	    	}
	    }).
	    error(function(data, status, headers, config) {
	    	console.log("Error"+data);
	    	$scope.networkErrorData = true;
	    	$scope.ajaxData = true;
	    });
	};

	// Adding Available Time
	$scope.addTodayEvents = function(){
		for(var i = 0; i < $scope.events.length ; i++){
			var time = $scope.events[i].timings;
			var startTime = time.split("-")[0];
			var endTime = time.split("-")[1];
			var stage = 0;
			for(var j = 0 ; j < $scope.timeDictionary.length ; j++){
				if(stage == 1){
					if($scope.timeDictionary[j].time == endTime){
						stage = 0;
					}else{
						$scope.timeDictionary[j].status = "blocked";
					}
				}

				if($scope.timeDictionary[j].time == startTime){
					$scope.timeDictionary[j].status = "blocked";
					stage = 1;
				}
			}
		}
		
		var set = 0;
		var timeStart = $scope.timeDictionary[0].time, timeEnd;
		
		for(var j = 0 ; j < $scope.timeDictionary.length ; j++){
			if(set == 0){
				if($scope.timeDictionary[j].status == "blocked"){
					timeEnd = $scope.timeDictionary[j].time;
					if(timeStart!=timeEnd)
						$scope.avails.push(timeStart+" - "+timeEnd);
					set = 1;
				}
				else if(j == $scope.timeDictionary.length - 1){
					$scope.avails.push(timeStart+" - "+$scope.timeDictionary[j].time);
				}
			}else{
				if($scope.timeDictionary[j].status == "available"){
					timeStart = $scope.timeDictionary[j].time;
					set = 0;
				}
			}
		}
		console.log($scope.avails);
	};
	
	
	/** Rooms **/
	$scope.getAllRoomDetails = function(){

		function queryPref(tx) {
		    tx.executeSql('SELECT * FROM ROOMS', [], querySuccess, queryError);
		}
		function querySuccess(tx, results) {
			if(results.rows.length > 0){
				
			}
			$scope.getAllRoomDetailsFromServer();
		}
		function queryError(err) {
		    console.log("Error checking Room Details: "+err.code);
		}
		
		mrbsGlobals.db.transaction(queryPref, queryError);
	};

	$scope.getAllRoomDetailsFromServer = function(){
		$scope.ajaxData = false;
		$scope.networkErrorData = false;
		var url = mrbsGlobals.protocol+mrbsGlobals.server+roomDetailsPath;
		console.log(url);
		$http({
			method: 'POST', 
			url:url,
			cache: true,
			timeout: mrbsGlobals.timeoutPeriod
		}).
	    success(function(result, status, headers, config) {
	    	$scope.ajaxData = true;
	    	if(result!=undefined){
	    		$scope.rooms = result.data;
	    		console.log($scope.rooms);
	    	}
	    }).
	    error(function(data, status, headers, config) {
	    	$scope.ajaxData = true;
	    	$scope.networkErrorData = true;
	    	console.log("Error");
	    });
	};

	//--- Auto Fallback to Home Page Starts --//
	var inactivityBar = document.getElementById("inactivityBar");
	inactivityBar.innerHTML = "";
	$idle.watch();

	$scope.$on('$idleStart', function() {
	});

	$scope.$on('$idleEnd', function() {
	});

	$scope.$on('$idleWarn', function(e, countdown) {
		inactivityBar.innerHTML += "<i class='icon-angle-left'></i>";
	});

	$scope.$on('$idleTimeout', function() {
		$location.path("home");
	});

	$scope.$on('$keepalive', function() {
		inactivityBar.innerHTML = "";
	});

	//--- Auto Fallback to Home Page Ends --//
};