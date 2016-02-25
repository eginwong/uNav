var uNav = angular.module('uNav', ['ui', 'ui.utils', 'ngRoute', 'ui.bootstrap', 'uiGmapgoogle-maps', 'ngResource']).
config(function($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider) {
  $locationProvider.hashPrefix('');
  $routeProvider.
  when('/', { templateUrl : 'app/partials/home.html', controller  : 'mainController'}).
  when('/search', {templateUrl : 'app/partials/search.html', controller  : 'searchController'}).
  when('/nearyou', { templateUrl : 'app/partials/nearyou.html', controller  : 'nearyouController'}).
  when('/about', { templateUrl : 'app/partials/about.html'}).
  when('/contact', { templateUrl : 'app/partials/contact.html', controller : 'contactController'});

  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCYtcbfLrd9BGzJ8HPdvsxDEedBdh3F-z4',
    v: '3.24', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
});

// create the controller and inject Angular's $scope
uNav.controller('mainController', function($scope) {
  // create a message to display in our view
});

uNav.controller('searchController', function($scope, $q, $timeout, $resource, $location, RoomService, uiGmapGoogleMapApi, uiGmapIsReady) {
  $.get('/api/buildings', function(obj){
    $scope.masterBuildings = JSON.parse(obj);
    $.each($scope.masterBuildings, function (idx, val) {
      $("#buildingsInUW").append('<option value="' + idx + '">' + idx + ' - ' + val.name + '</option>');
    });
    $("#buildingsInUW").chosen({ width: "95%" });
  });

  $( "#buildingsInUW" ).change(function() {
    $scope.build = $("#buildingsInUW option:selected").val();
    $scope.map.center = {latitude: $scope.masterBuildings[$scope.build].coordinates[1], longitude: $scope.masterBuildings[$scope.build].coordinates[0]};
    $scope.map.zoom = 19;

    $.get('/api/graph/rooms', function(obj){
      var count = 0;
      var appendage;
      $.each(JSON.parse(obj), function (idx, val) {
        var countOG = count;
        count = parseInt(val.charAt(val.indexOf(" ") + 1));
        if (count > countOG) {
          if(countOG != 0){
            appendage+='</optgroup>';
            $("#roomSrc").append(appendage);
            $("#roomDest").append(appendage);
          }
          appendage = '<optgroup label="' + $scope.build + ' Floor ' + count + '">';
        }
        appendage+='<option value="' + val + '">' + val + '</option>';
      });
      //The last one.
      appendage+='</optgroup>';
      $("#roomSrc").append(appendage);
      $("#roomDest").append(appendage);

      $("#roomSrc").chosen({ width: "10%" });
      $("#roomDest").chosen({ width: "10%" });
    });

    $timeout(function(empty) {
      $scope.$apply();
    },0);
  });

  $scope.restart = function(){
    if($scope.flightPath != undefined){
      $scope.flightPath.setMap(null);
      $scope.distance = null;
    }
    $scope.build = undefined;
    $scope.src = null;
    $scope.dest = null;
    $scope.map.center = {latitude: 43.4722854, longitude: -80.5448576};
    $scope.map.zoom = 16;
    $scope.map.markers = [];
    $(".chosen-select").val('').trigger("chosen:updated");
  }

  var mapImage = $scope.build;

  $( "#roomSrc" ).change(function() {
    $scope.src = $("#roomSrc option:selected").val()
    $scope.plot("src");
    $scope.drawDirections();
  });

  $( "#roomDest" ).change(function() {
    $scope.dest = $("#roomDest option:selected").val()
    $scope.plot("dest");
    $scope.drawDirections();
  });

  $scope.geolocationAvailable = navigator.geolocation ? true : false;

  uiGmapGoogleMapApi.then(function (maps) {
    $scope.map = {
      center: {
        latitude: 43.4722854,
        longitude: -80.5448576
      },
      zoom: 16,
      pan: 1,
      options: $scope.mapOptions,
      markers: [],
      events: {},
      control: {}
    }
  });

  $scope.windowOptions = {
    visible: false,
  };

  $scope.plot = function (node) {
    var map = $scope.map;
    var mark = $scope.map.markers;
    if (node == "src"){
      RoomService.getID($scope.src.replace(/\s+/g, '')).then(function(result){
        $scope.srcNode = result;
        var marker = {
          id: 0,
          coords: {
            latitude: $scope.srcNode._y,
            longitude: $scope.srcNode._x
          },
          name: $scope.src
        }
        for(var i = 0; i < mark.length; i++) {
          if (mark[i].id == 0) {
            mark.splice(i, 1);
            break;
          }
        }
        $scope.map.markers.push(marker);
      })
    }
    else if (node == "dest") {
      RoomService.getID($scope.dest.replace(/\s+/g, '')).then(function(result){
        $scope.destNode = result;
        var marker = {
          id: 1,
          coords: {
            latitude: $scope.destNode._y,
            longitude: $scope.destNode._x
          },
          name: $scope.dest
        }
        for(var i = 0; i < mark.length; i++) {
          if (mark[i].id == 1) {
            mark.splice(i, 1);
            break;
          }
        }
        $scope.map.markers.push(marker);
      })
    }
  }

  $scope.getDirections = function() {
    if($scope.src != undefined && $scope.dest != undefined){
      // instantiate google map objects for directions
      $.get('/api/astar/' + $scope.src.replace(/\s+/g, '') +'/'+ $scope.dest.replace(/\s+/g, ''), function(obj){
        var leng = JSON.parse(obj).length;
        var waypts = [];
        $.each(JSON.parse(obj), function (idx, val) {
          if (idx == 0 || idx == (leng - 1)){
          }
          else if(idx == leng) {
            alert(val.dist);
          }
          else{
            waypts.push({location: new google.maps.LatLng(val._y, val._x)});
          }
        })

        var directionsDisplay = new google.maps.DirectionsRenderer();
        var directionsService = new google.maps.DirectionsService();
        var geocoder = new google.maps.Geocoder();

        console.log(waypts);
        // directions object -- with defaults
        $scope.directions = {
          origin: new google.maps.LatLng($scope.srcNode._y, $scope.srcNode._x),
          destination: new google.maps.LatLng($scope.destNode._y, $scope.destNode._x),
          waypoints: waypts,
          showList: false
        }

        var request = {
          origin: $scope.directions.origin,
          destination: $scope.directions.destination,
          travelMode: google.maps.DirectionsTravelMode.WALKING
        };
        directionsService.route(request, function (response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            directionsDisplay.setMap($scope.map.control.getGMap());
            directionsDisplay.setPanel(document.getElementById('directionsList'));
            $scope.directions.showList = true;
          } else {
            alert('Google route unsuccesfull!');
          }
        });
      });
    }
    else{
      alert("You are missing input.");
    }
  }

  $scope.drawDirections = function() {
    if($scope.src != undefined && $scope.dest != undefined){
      if($scope.flightPath != undefined){
        $scope.flightPath.setMap(null);
      }
      // instantiate google map objects for directions
      $.get('/api/astar/' + $scope.src.replace(/\s+/g, '') +'/'+ $scope.dest.replace(/\s+/g, ''), function(obj){
        var leng = JSON.parse(obj).length;
        var waypts = [];
        $.each(JSON.parse(obj), function (idx, val) {
          if(idx == (leng-1)) {
            $scope.distance = (val.dist);
          }
          else{
            waypts.push({lat: val.latitude, lng: val.longitude});
          }
        })
        $scope.flightPath = new google.maps.Polyline({
          map: $scope.map.control.getGMap(),
          path: waypts,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
      })
    }
  }

  uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
  .then(function (instances) {
  })

  // $scope.findMe = function () {
  //   if ($scope.geolocationAvailable) {
  //     navigator.geolocation.getCurrentPosition(function (position) {
  //       $scope.map.center = {
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude
  //       };
  //       $scope.$apply();
  //       console.log('Found You: ' + position.coords.latitude + ' || ' + position.coords.longitude + position.coords.altitude);
  //       $scope.markerLat = position.coords.latitude;
  //       $scope.markerLng = position.coords.longitude;
  //     });
  //   }
  // };

  $scope.mapOptions = {
    minZoom: 3,
    zoomControl: false,
    draggable: true,
    navigationControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: false,
    keyboardShortcuts: true,
    markers: {
      selected: {}
    },
    styles: [{
      stylers: [
        { hue: "#00ffe6" },
        { saturation: -20 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }]
  };
});


uNav.controller('nearyouController', ['$scope', function($scope) {
  $scope.message = 'nearyou';
}]);

uNav.factory('RoomService', function($q, $timeout, $http) {
  return {
    getID: function(id){
      return $http.get('/api/graph/rooms/' + id)
      .then(function(response) {
        if (typeof response.data === 'object') {
          return response.data;
        } else {
          // invalid response
          return $q.reject(response.data);
        }
      }, function(response){
        return $q.reject(response.data);
      });
    }
  }
});

uNav.controller('contactController', function ($scope, $http){

  $scope.sendMail = function () {
    var data = ({
      contactName : $scope.contactName,
      contactEmail : $scope.contactEmail,
      contactReason : $scope.contactReason,
      contactMsg : $scope.contactMsg
    });
    // Simple POST request example (passing data) :
    $http.post('/api/contact-form', data).
    success(function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.message = "Huzzah";
      alert('Thanks for your message, ' + data.contactName + '. You Rock!');
    });
  }
})
