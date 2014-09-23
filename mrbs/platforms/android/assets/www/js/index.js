/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var isSubscribed = false;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        this.onDeviceReady();

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        mrbsGlobals.db.transaction(populateDB, errorPopulating, successPopulating);  
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
    }

};

/** Function to populate DB **/
function populateDB(tx){
    tx.executeSql('CREATE TABLE IF NOT EXISTS PREFERENCES (prefkey unique, prefvalue)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS EVENTS (title, owner, timings)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS ROOMS (roomname, status, timings)');
    tx.executeSql('INSERT OR IGNORE INTO PREFERENCES (prefkey) VALUES ("server")');
    tx.executeSql('INSERT OR IGNORE INTO PREFERENCES (prefkey) VALUES ("roomName")');
    tx.executeSql('INSERT OR IGNORE INTO PREFERENCES (prefkey) VALUES ("roomStatus")');
    tx.executeSql('INSERT OR IGNORE INTO PREFERENCES (prefkey) VALUES ("deviceSubsId")');
}
function errorPopulating(tx, err){
    console.log("Error Populating Database");
}
function successPopulating(){
    console.log("Success Populating Database");
    checkDevSubscription();
}

/** Function to register for Notifications **/
function registerForNotifications(){
    console.log("Registering for Notifications");
    var pushNotification;
    
    pushNotification = window.plugins.pushNotification;
    console.log(isSubscribed);

    if(isSubscribed==false){
        pushNotification.register(
            successHandler,
            errorHandler,
            {
                "senderID":"276975162173",
                "ecb":"onNotification"
        });
    }else{
        pushNotification.bindDevice(
            successHandler,
            errorHandler,
            {});
    }

    function successHandler (result){
        console.log("Registered for Push");
    }
    function errorHandler (result){
        console.log("Not Registered for Push");
    }
}
/** Function to handle notification after Subsription **/
function onNotification(e){
    console.log("Notified");
    a = e;
    switch(e.event)
    {
        case 'registered':
        if ( e.regid.length > 0 )
        {
            console.log("regID = " + e.regid);
            if(isSubscribed==false){
                saveSubIdToDB(e.regid);
            }else{

            }
        }
        break;
        
        case 'message':
            console.log("Notification Recvd:");
        
            if (e.foreground){
                console.log("foreground activity");
                var myEl = angular.element( document.querySelector('#appView'));
                var myScope = angular.element(myEl).scope();
                myScope.recvNotifications();
            }
            else
            {   // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                    alert("Prompting to open App");
                else
                    alert(JSON.stringfy(e));
            }
        break;
        
        case 'error':
            
        break;
        
        default:
           
        break;
    }
}
/** Function to check whether the device has subscribed to recv. Notifications **/
function checkDevSubscription(){
    console.log("Checking Device Subsription");
    function querySubs(tx) {
        tx.executeSql('SELECT * FROM PREFERENCES', [], querySuccess, queryError);
    }
    function querySuccess(tx, results) {
        if(results.rows.item(3).prefvalue != null){
            mrbsGlobals.subscriptionId = results.rows.item(3).prefvalue.toString();
            isSubscribed = true;
        }
        registerForNotifications();
    }
    function queryError(err) {
        console.log("Error checking Subscrition: "+err.code);
        registerForNotifications();
    }     
    mrbsGlobals.db.transaction(querySubs, queryError);
}

function saveSubIdToDB(regid){
    function updatePrefIntoDB(tx) {
        tx.executeSql('UPDATE PREFERENCES SET prefvalue = "'+regid+'" WHERE prefkey = "deviceSubsId"');
    }
    function updateSuccess(tx, results) {
        console.log("Saved Reg Id to DB");
        mrbsGlobals.subscriptionId = regid;
        var myEl = angular.element( document.querySelector('#appView'));
        var myScope = angular.element(myEl).scope();
        if(mrbsGlobals.server == undefined && mrbsGlobals.roomName == undefined){
            mrbsGlobals.isRegistered = false;
        }else{
            mrbsGlobals.isRegistered = true;
            myScope.registerDeviceSubs();
        }
    }
    function errorDB(err) {
        $scope.serverMessage = "Error Saving Prefernces to DB. Retry";
    }
    
    mrbsGlobals.db.transaction(updatePrefIntoDB, errorDB, updateSuccess);
}