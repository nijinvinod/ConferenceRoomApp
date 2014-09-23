var mrbsGlobals = {};

mrbsGlobals.db = window.openDatabase("DatabaseMRBS", "1.0", "mrbs db", 200000);

mrbsGlobals.protocol = "http://"
mrbsGlobals.server = undefined;
mrbsGlobals.roomName = undefined;
mrbsGlobals.subscriptionId = undefined;
mrbsGlobals.isRegistered = false;
mrbsGlobals.timeoutPeriod = 20000;
mrbsGlobals.roomDetails = {};

mrbsGlobals.getOwner = function(mail){
	var name = mail.split("@");
	var names = name[0].split(".");
	var fname = names[0];
	if(names[1] == undefined)
		return names[0];
	else
		return names[0] + names[1];
};

mrbsGlobals.loadingActivity = function(activity){
	if(activity=="show"){
		return "loadingContent";
	}else{
		return "";
	}
}
