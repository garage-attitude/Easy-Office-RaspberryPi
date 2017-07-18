var rpio = require('rpio');
var macModule = require('getmac');
var http = require("http");
var io = require('socket.io-client');
var exec = require('child_process').exec;
var statesArray = [];
var deviceMacAddress = GetDeviceMacAddress();
var previousTimeStamp = Math.round(new Date().getTime());
var previousState = false;
var updateIntervalID;
var newUpdateIntervalID;
var updateClock = 10000;
var sensitivity = 40;
var PIN_NUMBER = 7;
var socket = io.connect('https://easy-office.herokuapp.com', {reconnect:true});

function GetDeviceMacAddress(){
	macModule.getMac(function(err,macAddress){
    		if (err)  throw err
    		deviceMacAddress = macAddress;
	})
}

function executeGitBatch(){
	exec('sudo sh git.sh',
		function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}

function UpdateRoomAvailability(){
	UpdateStatesArray(previousState);
	var payload = { macAddress: deviceMacAddress, isBusy: GetRoomState()};
	console.log("INFO | Sending: " + JSON.stringify(payload));
	statesArray = [];
	CallHerokuService(JSON.stringify(payload));
}

function CallHerokuService(payload){
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
	    console.log("INFO | Receiving: " + body);
	  });
	});

	req.on('error', function(e) {
	  console.log('WARN | Impossible to send request: ' + e.message);
	});

	req.write(payload);
	req.end();
}

function GetRoomState(){
	var elapseTimeBusyState = 0;
	var elapseTimeFreeState = 0;
	for(var i = 0; i < statesArray.length; i++){
		if(statesArray[i].isBusy){
			elapseTimeBusyState = elapseTimeBusyState + statesArray[i].elapseTime;
		}else{
			elapseTimeFreeState = elapseTimeFreeState + statesArray[i].elapseTime;
		}
	}

	var percentBusyState = (elapseTimeBusyState / (elapseTimeFreeState + elapseTimeBusyState)) * 100;
	var percentFreeState = (elapseTimeFreeState / (elapseTimeFreeState + elapseTimeBusyState)) * 100;

	console.log("INFO: " + percentFreeState + "% free");
	console.log("INFO: " + percentBusyState + "% busy");

	if(percentBusyState >= sensitivity){
		return true;
	}
	else{
		return false;
	}
}

function UpdateStatesArray(currentState){
	var currentTimeStamp = Math.round(new Date().getTime());
	var elapseTime = currentTimeStamp - previousTimeStamp;
	var newEvent = {"isBusy":previousState, "elapseTime":elapseTime};

	statesArray.push(newEvent);
	previousTimeStamp = currentTimeStamp;
	previousState = currentState;
}

function CompareWithPreviousState(currentState){
	if(previousState != currentState){
		UpdateStatesArray(currentState);
	}
}

function pollcb(pin){
        var currentState = rpio.read(pin) ? true : false;
        CompareWithPreviousState(currentState);
}

rpio.open(PIN_NUMBER, rpio.INPUT, rpio.PULL_DOWN);

rpio.poll(PIN_NUMBER, pollcb);










updateIntervalID = setInterval( function() { UpdateRoomAvailability();}, updateClock);

socket.on('update_config', function(input){
	var result = JSON.parse(input);
	if(sensitivity != result.configs.sensor.sensitivity){
		sensitivity = result.configs.sensor.sensitivity;
		console.log("INFO | New sensitivity value is: " + sensitivity);
	}
		
	if(updateClock != result.configs.sensor.captureInterval){
		newUpdateIntervalID = setInterval( function() { UpdateRoomAvailability();}, result.configs.sensor.captureInterval);
		clearInterval(updateIntervalID);
		updateIntervalID = newUpdateIntervalID;
		updateClock = result.configs.sensor.captureInterval;
		console.log("INFO | New capture interval value is: " + updateClock);
	}
});

setInterval( function() { executeGitBatch();}, 30000);
