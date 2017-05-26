var rpio = require('rpio');
var eventsArray = [];
var deviceMacAddress = GetDeviceMacAddress();
var finalBusyState = false;
var lastUpdateTimeStamp = Math.round(new Date().getTime());
var lastBusyState = false;

function GetDeviceMacAddress(){
}

function UpdateRoomAvailability(busyState){
	UpdateEventsArray(lastBusyState);
	console.log(eventsArray);
	finalBusyState = GetApproximativeBusyState();
	eventsArray = [];
	//call api of easy-office project
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
	console.log("Free: " + percentFreeState + " Busy: " + percentBusyState);
	return true;
}

function UpdateEventsArray(currentBusyState){
	var currentTimeStamp = Math.round(new Date().getTime());
	var elapseTime = currentTimeStamp - lastUpdateTimeStamp;
	var newArrayObject = {"isBusy":lastBusyState, "elapseTime":elapseTime};

	eventsArray.push(newArrayObject);
	lastUpdateTimeStamp = currentTimeStamp;
	lastBusyState = currentBusyState;
}

function UpdatePreviousState(currentBusyState){
	if(lastBusyState != currentBusyState){
		UpdateEventsArray(currentBusyState);
	}
}

rpio.open(7, rpio.INPUT, rpio.PULL_DOWN);

function pollcb(pin)
{
        var currentRPIOState = rpio.read(pin) ? true : false;
	
	if (currentRPIOState){
		console.log("State is true, someone is moving");
	}else{
		console.log("State is false, empty room");
	}

        UpdatePreviousState(currentRPIOState);
}

rpio.poll(7, pollcb);

setInterval( function() { UpdateRoomAvailability(finalBusyState);}, 30000);