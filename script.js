var directionsService;
var directionsDisplay;
var getdrawvalues = [];
var latgArray = [];
var lngArray = [];
var pointA;
var pointB;
var km = 0;
var map;
var b = 0;
var marker;
var markerTemp = new Array();
var buttonBooleanValue = false;
var factor = Math.pow(10, 3);


var gasoline = parseFloat(document.getElementById("gas").value);	// liters
var avgConsumption = parseFloat(document.getElementById("usage").value); // l/100km  0,1689/1km 	0,0001689/1m	 // l/100km  0,1689/1km 	0,0001689/1m														//gali nuvažiuoti 2,309 km (230,9) vidutiniu greiciu
var avgSpeed = parseFloat(document.getElementById("speed").value); // km/h
var maxDriveLenghtInKm;
var maxDriveLenghtInM;
var litersToDriveOneMeter;
var gasolineLeft;
var distanceToStop
var hours;
var minute;
var seconds;
var dayTime;

//functions are initiated at startup
slider();
calculateStopPoint();

var input = document.getElementById('searchTextField');
var input2 = document.getElementById('searchTextField2');
var autocomplete = new google.maps.places.Autocomplete(input);
var autocomplete2 = new google.maps.places.Autocomplete(input2);

var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();

var latLng = new google.maps.LatLng(55.7262077, 21.17333210000004);

//slider pointer image
var image = {
    url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(20, 32),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(0, 32)
};


var mapOptions = {
    zoom: 10,
    center: latLng
};

map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
document.getElementById('get').onclick= function(){ calculateRoute();};
document.getElementById('gasoline').innerHTML = gasoline + " liters";
document.getElementById('consumption').innerHTML = avgConsumption + " liters";
var getStop = document.getElementById('getStop');
var getAllCoord = document.getElementById('getCoors');

directionsDisplay.setMap(map);


function calculateRoute(pointA, pointB){
    var request = {
        origin: pointA,
        destination: pointB,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
    };

    directionsService.route(request, function(result, status){
        if (status == "OK") {
            //render directions here...
            directionsDisplay.setDirections(result);
            var overviewPath = result.routes[0].overview_path, overviewPathGeo = [];
            for (var i = 0; i < overviewPath.length; i++) {
                overviewPathGeo.push([overviewPath[i].lng(), overviewPath[i].lat()]);
            }
            console.log(overviewPath);
            drawpolyMap(overviewPath);
        }
    });
}


//gets the values from input fields
function displayR() {
    usage();
    pointA =  document.getElementById("searchTextField").value;
    pointB =  document.getElementById("searchTextField2").value;
    console.log(pointA);
    calculateRoute(pointA, pointB);
}


function drawpolyMap(getdrawvalues){
    var latStr1 = latLng.lat();
    var latStr = latStr1.toFixed(5);

    var LongStr1 = latLng.lng();
    var LongStr = LongStr1.toFixed(5);

    for (var i = 0; i < getdrawvalues.length; i++) {

        var latgAry1 = getdrawvalues[i].lat();
        var latgAry = latgAry1.toFixed(5);

        var lngAry1 = getdrawvalues[i].lng();
        var lngAry = lngAry1.toFixed(5);

        latgArray.push(latgAry1);
        lngArray.push(lngAry1);
        ///////////////////////////////////////////////////////////////////////
        if (latgArray[0] == "55.726130000000005" && lngArray[0] == "21.1734"){
        }
        ///////////////////////////////////////////////////////////////////////
    }
    getStop.onclick = function(event) {
        getStopPointMarker ();
    };

    getAllCoord.onclick = function(event) {
        //remove and add markers on click again
        if(!buttonBooleanValue){
            addAllMarkers ();
            buttonBooleanValue = true;
        }
        else {
            markerTemp.forEach(function(element) {
                element.setMap(null);
            });
            buttonBooleanValue = false;
        }
    };
}


function getStopPointMarker (){
    var arrayLength = 0;
    for (var i = 0; i < latgArray.length-1; i++) {
        arrayLength++;
        var pointA = new google.maps.LatLng(latgArray[i], lngArray[i]);
        var pointB = new google.maps.LatLng(latgArray[i+1], lngArray[i+1]);
        var distance = google.maps.geometry.spherical.computeDistanceBetween(pointA, pointB);
        km = km + distance;

        gasoline = gasoline - (distance * litersToDriveOneMeter);
        if (gasoline <= 0){
            if (b == 0){

                var marker2 = new google.maps.Marker ({
                    position: pointB,
                    map: map,
                    title: ""+pointB
                });

                distanceToStop = Math.round((km / 1000) * factor) / factor;
                document.getElementById('distanceToStop').innerHTML = distanceToStop + " kilometers";
                document.getElementById('startTime').innerHTML = getCurrentDate();
                b++;
                calculateTime();
                setValue(arrayLength);
            }
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }
    //make meters to kilometers
    km =  km / 1000;
    //round to three numbers after comma

    km = Math.round(km * factor) / factor;

    //console.log(km + "km");
}


function addAllMarkers (){
    for (var i = 0; i < latgArray.length-1; i++) {
        var pointA = new google.maps.LatLng(latgArray[i], lngArray[i]);
        var pointB = new google.maps.LatLng(latgArray[i+1], lngArray[i+1]);
        var distance = google.maps.geometry.spherical.computeDistanceBetween(pointA, pointB);
        km = km + distance;
        markerTemp[i] = new google.maps.Marker ({
            position: pointA,
            map: map,
            title: ""+pointA
        });
    }
}



function calculateStopPoint(){
    //calculating how mutch kilometers left to drive, while fuel tank will be empty
    //maxDriveLenght == km
    maxDriveLenghtInKm = (gasoline / avgConsumption) * 100;
    maxDriveLenghtInKm = Math.round(maxDriveLenghtInKm * factor) / factor;

    //maxDriveLenghtInM == m
    maxDriveLenghtInM = maxDriveLenghtInKm * 1000;

    //calculating how mutch gasoline need to drive 1 meter
    litersToDriveOneMeter = avgConsumption / 100 / 1000;
}


//get current time, when press "get stop point". This function is called from getStopPointMarker() function
function getCurrentDate(){
    var date = new Date(); // for now
    var hours = date.getHours(); // => 9
    var minutes = date.getMinutes(); // =>  30
    var seconds = date.getSeconds();
    if (seconds < 10){
        seconds = "0"+seconds;
    }else if(minutes <10){
        minutes = "0"+minutes;
    }
    var dayTime = hours +':'+ minutes +':'+seconds;
    return dayTime;
}


//calculating time until car will be out of fuel
function calculateTime (){
//Getting average speed/seconds and length of the drive/seconds
  var speedInSecond = avgSpeed/3600;
  var time = distanceToStop/ speedInSecond;
  time = Math.round(time);

  var finishTime = getCurrentDate();
  finishTime = finishTime.toString().split(':');

//Converting seconds to minutes, hours and adding it to starting time
  var min = 0;
  var h = 0;
  var d =0;

  var finishSeconds = (+finishTime[2]+ +time );
  if(finishSeconds >=60){
    min = parseInt(finishSeconds / 60);
  finishSeconds = finishSeconds - (min*60);
  console.log(min);
  if(finishSeconds<10){
    finishSeconds = "0"+finishSeconds;
  }
}

var finishMinutes = (+finishTime[1]+ +min);
  if(finishMinutes >=60){
    h = parseInt(finishMinutes / 60);
  finishMinutes = finishMinutes - (h*60);
  if(finishMinutes<10){
    finishMinutes = "0"+finishMinutes;
  }
}

var finishHours = (+finishTime[0]+ +h);

  if(finishHours >=24){
    d = parseInt(finishHours / 24);
  finishHours = finishHours - (d*24);
  if(finishHours<10){
    finishHours = "0"+finishHours;
  }
}

  document.getElementById('stopTime').innerHTML = finishHours +":"+ finishMinutes +":"+ finishSeconds;

  //console.log(finishTime[2]);
}

//add and hide markers, when slide polyline using coordinates
function slider()
{
    var slideListener;  // M
    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");
    output.innerHTML = slider.value;

    slider.oninput = function()
    {
        var slide = output.innerHTML = this.value;
        slideListener = slide;
        var pointA = new google.maps.LatLng(latgArray[slide], lngArray[slide]);
        console.log(slideListener);
       var gasoline = parseFloat(document.getElementById("gas").value);
        for (var i = 0; i < slideListener; i++ )
        {
            var pointAS = new google.maps.LatLng(latgArray[i], lngArray[i]);
            var pointBS = new google.maps.LatLng(latgArray[i+1], lngArray[i+1]);
            var distance = google.maps.geometry.spherical.computeDistanceBetween(pointAS, pointBS);

            km = km + distance;

            gasoline = gasoline - (distance * litersToDriveOneMeter);

//Time calculation
            distanceToStop = (km/1000);
            calculateTime();
        }
        km = Math.round((km / 1000) * factor) / factor;
        gasoline = Math.round(gasoline * factor) / factor;
        if(gasoline < 0){
            gasoline = 0;
        }
        document.getElementById('gasoline').innerHTML = gasoline + " liters";
        document.getElementById('traveledDistance').innerHTML = km + " kilometers";

        //hide previous marker and add new one
        if (marker != null) {
            marker.setMap(null);
        }
        marker = new google.maps.Marker ({
            position: pointA,
            icon: image,
            map: map,
            title: ""+pointA
        });
    }
}


//set values to slider, when stop point is set
function setValue(value){
    var slider = document.getElementById("myRange");
    slider.value = "0";
    slider.max = value;
}


function reload(){
    location.reload();
}
function usage() {
    avgConsumption = parseFloat(document.getElementById("usage").value);
    gasoline =  parseFloat(document.getElementById("gas").value);
    document.getElementById('gasoline').innerHTML = gasoline + " liters";
    document.getElementById('consumption').innerHTML = avgConsumption + " liters";
    avgSpeed = parseFloat(document.getElementById("speed").value)
}
