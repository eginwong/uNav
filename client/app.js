var uNav = angular.module('uNav', ['ui', 'ui.utils', 'ngRoute', 'ui.bootstrap', 'uiGmapgoogle-maps', 'ngResource', 'localytics.directives']).
config(function($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider) {
  $locationProvider.hashPrefix('');
  $routeProvider.
  when('/', { templateUrl : 'app/partials/home.html', controller  : 'mainController'}).
  when('/search', {templateUrl : 'app/partials/search.html', controller  : 'searchController'}).
  when('/navigation', {templateUrl : 'app/partials/navigation.html', controller  : 'navController'}).
  when('/nearyou', { templateUrl : 'app/partials/nearyou.html', controller  : 'nearyouController'}).
  when('/about', { templateUrl : 'app/partials/about.html'}).
  when('/contact', { templateUrl : 'app/partials/contact.html'});

  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCYtcbfLrd9BGzJ8HPdvsxDEedBdh3F-z4',
    v: '3.24', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
});

uNav.service('sharedProperties', function() {
  var stringValue = 'test string value';
  var objectValue = {
    data: 'test object value'
  };

  return {
    getString: function() {
      return stringValue;
    },
    setString: function(value) {
      stringValue = value;
    },
    getObject: function() {
      return objectValue;
    }
  }
});

uNav.directive('chosen', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      $timeout(function () {
        element.chosen();
      }, 200, false);
    }
  }
});

// create the controller and inject Angular's $scope
uNav.controller('mainController', function($scope) {
  // create a message to display in our view
});

uNav.controller('searchController', function($scope, $timeout, $resource, $location, sharedProperties) {
  $scope.message = 'search';

  // Store value in between controllers. And redirect to new page.
  $scope.buildings = $resource('/api/buildings').query();

  $scope.store = function() {
    sharedProperties.setString($scope.buildOfChoice[0]);
    $location.path('/navigation');
    $timeout(function(empty) {
      $scope.$apply();
    },0);
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

uNav.factory('DataService', function($q, $timeout, $http) {
  return {
    getThings: function(){
      return $http.get('/api/graph/rooms')
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

uNav.controller('navController', function($scope, $timeout, sharedProperties, uiGmapGoogleMapApi, uiGmapIsReady, DataService, RoomService) {


  // dynamically set the map based on which building we're grabbing it from - take from uwapi
  $scope.message = 'navigation';
  var mapImage = sharedProperties.getString();
  $('#buildingmap').attr("src", "images/Waterloo Floor Plans/"+mapImage+"1.png");

  DataService.getThings().then(function(result){
    $scope.rooms = result;
  });

  $scope.tally = 0;
  $scope.geolocationAvailable = navigator.geolocation ? true : false;


  uiGmapGoogleMapApi.then(function (maps) {
    $scope.googlemap = {};
    $scope.map = {
      center: {
        latitude: 43.47035091238624,
        longitude: -80.54049253463745
      },
      zoom: 20,
      pan: 1,
      options: $scope.mapOptions,
      markers: [],
      events: {}
    }
  });

  $scope.windowOptions = {
    visible: false,
    content: "Frustration"
  };

  $scope.onClick = function() {
    alert("Hello");
    $scope.windowOptions.visible = !$scope.windowOptions.visible;
  };

  $scope.closeClick = function() {
    $scope.windowOptions.visible = false;
  };

  uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
  .then(function (instances) {
    console.log(instances[0].map); // get the current map
  })
  .then(function () {
    var map = $scope.map;
    var mark = $scope.map.markers;
    var infoWindow = document.getElementById("infowindow");
    $scope.$watchGroup(["src", "dest"], function(newVal, oldVal){
      if($scope.src != undefined) {
        RoomService.getID($scope.src.replace(/\s+/g, '')).then(function(result){
          $scope.srcNode = result;
          var marker = {
            id: 0,
            coords: {
              latitude: $scope.srcNode._y,
              longitude: $scope.srcNode._x
            }
          };

            for(var i = 0; i < mark.length; i++) {
              if (mark[i].id == 0) {
                mark.splice(i, 1);
                break;
              }
            }
            $scope.map.markers.push(marker);
        })
      }



      // function createInfoWindow(marker, popupContent) {
      //   google.maps.event.addListener(marker, 'click', function () {
      //     infoWindow.setContent(popupContent);
      //     infoWindow.open(pointMap.map, this);
      //   });

      if($scope.dest != undefined) {
        RoomService.getID($scope.dest.replace(/\s+/g, '')).then(function(result){
          $scope.destNode = result;
          var marker = {
            id: 1,
            coords: {
              latitude: $scope.destNode._y,
              longitude: $scope.destNode._x
            }
          };
          for(var i = 0; i < mark.length; i++) {
            if (mark[i].id == 1) {
              mark.splice(i, 1);
              break;
            }
          }
          $scope.map.markers.push(marker);
        })
      }
      if($scope.src != undefined && $scope.dest != undefined){
        alert($scope.src + " to " + $scope.dest);
      }
    })
  });

  //
  //
  // $scope.findMe = function () {
  //   if ($scope.geolocationAvailable) {
  //     navigator.geolocation.getCurrentPosition(function (position) {
  //       $scope.map.center = {
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude
  //       };
  //       $scope.$apply();
  //       console.log('Found You: ' + position.coords.latitude + ' || ' + position.coords.longitude);
  //       $scope.markerLat = position.coords.latitude;
  //       $scope.markerLng = position.coords.longitude;
  //       $scope.addMarker();
  //     }, function () {
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
