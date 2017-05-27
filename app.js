var rpio = require('rpio');
var macModule = require('getmac');
var http = require("http");
var io = require('socket.io-client');

var eventsArray = [];
var deviceMacAddress = GetDeviceMacAddress();
var lastUpdateTimeStamp = Math.round(new Date().getTime());
var lastBusyState = false;
var setIntervalID;

var updateInterval = 10000;
var busyStateSensitivity = 40;
var PIN_NUMBER = 7;

var socket = io.connect('https://easy-office.herokuapp.com', {reconnect:true});

function GetDeviceMacAddress(){
	macModule.getMac(function(err,macAddress){
    		if (err)  throw err
    		deviceMacAddress = macAddress;
	})
}

function UpdateRoomAvailability(){
	UpdateEventsArray(lastBusyState);

	console.log("*** Updating room availability ***");
	var requestData = { macAddress: deviceMacAddress, isBusy: GetApproximativeBusyState()};
	console.log("INFO - --> Sending data to Heroku: " + JSON.stringify(requestData));

	CallHerokuService(JSON.stringify(requestData));
}

function CallHerokuService(requestData){
	var options = {
	  hostname: 'easy-office.herokuapp.com',
	  port: 80,
	  path: '/updateRoomAvailability',
	  method: 'POST',
	  headers: {
	      'Content-Type': 'application/json',
	  }
	};

	var req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  res.on('data', function (body) {
	    console.log("INFO - <-- Receiving data from Heroku " + body);
	  });
	});

	req.on('error', function(e) {
	  console.log('WARN - Problem with Heroku app: ' + e.message);
	});

	req.write(requestData);
	req.end();
}

function GetApproximativeBusyState(){
	var elapseTimeBusyState = 0;
	var elapseTimeFreeState = 0;
	
	for(var i = 0; i < eventsArray.length; i++){
		if(eventsArray[i].isBusy){
			elapseTimeBusyState = elapseTimeBusyState + eventsArray[i].elapseTime;
		}else{
			elapseTimeFreeState = elapseTimeFreeState + eventsArray[i].elapseTime;
		}
	}

	var totalElapseTime = elapseTimeFreeState + elapseTimeBusyState;
	var percentBusyState = (elapseTimeBusyState / totalElapseTime) * 100;
	var percentFreeState = (elapseTimeFreeState / totalElapseTime) * 100;

	console.log("INFO - Percentage of FREE state: " + percentFreeState);
	console.log("INFO - Percentage of BUSY state: " + percentBusyState);
	
	eventsArray = [];

	if(percentBusyState >= busyStateSensitivity){
		return true;
	}
	else{
		return false;
	}
}

function UpdateEventsArray(currentBusyState){
	var currentTimeStamp = Math.round(new Date().getTime());
	var elapseTime = currentTimeStamp - lastUpdateTimeStamp;
	var newEvent = {"isBusy":lastBusyState, "elapseTime":elapseTime};

	eventsArray.push(newEvent);
	lastUpdateTimeStamp = currentTimeStamp;
	lastBusyState = currentBusyState;
}

function UpdatePreviousState(currentBusyState){
	if(lastBusyState != currentBusyState){
		UpdateEventsArray(currentBusyState);
	}
}

function pollcb(pin)
{
        var currentRPIOState = rpio.read(pin) ? true : false;
        UpdatePreviousState(currentRPIOState);
}

rpio.open(PIN_NUMBER, rpio.INPUT, rpio.PULL_DOWN);

rpio.poll(PIN_NUMBER, pollcb);

setIntervalID = setInterval( function() { UpdateRoomAvailability();}, updateInterval);

socket.on('configUpdate', function(config){
	console.log("Updating sensor configuration");

	busyStateSensitivity = config.busySensitivity;
	clearInterval(setIntervalID);
	setIntervalID = setInterval( function() { UpdateRoomAvailability();}, config.updateInterval);

	console.log("UpdateInterval value: " + config.updateInterval);
	console.log("BusyStateSensitivity value: " + config.busySensitivity);
});