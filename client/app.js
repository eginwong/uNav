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

uNav.controller('navController', function($scope, $resource, $timeout, sharedProperties, uiGmapGoogleMapApi, uiGmapIsReady) {
  // dynamically set the map based on which building we're grabbing it from - take from uwapi
  $scope.message = 'navigation';
  var mapImage = sharedProperties.getString();
  $('#buildingmap').attr("src", "images/Waterloo Floor Plans/"+mapImage+"1.png");

  $scope.rooms = $resource('/api/graph/rooms').query();

  $scope.geolocationAvailable = navigator.geolocation ? true : false;

  // uiGmapGoogleMapApi is a promise.
  // The "then" callback function provides the google.maps object.

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
      events: {
        click: function (map, eventName, originalEventArgs) {
          var e = originalEventArgs[0];
          var lat = e.latLng.lat(),lon = e.latLng.lng();
          var marker = {
            id: Date.now(),
            coords: {
              latitude: lat,
              longitude: lon
            }
          };
          $scope.map.markers.push(marker);
          console.log($scope.map.markers);
          $scope.$apply();
        }
      }
    }
  });

  uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
  .then(function (instances) {
    console.log(instances[0].map); // get the current map
  })
  .then(function () {
    alert("Hello");
    $scope.$watchGroup(["src", "dest"], function(newVal, oldVal){
        if($scope.src != undefined && $scope.dest != undefined){
          alert($scope.src + " to " + $scope.dest);
        }
      })
    // var map = $scope.map;
    // $scope.update = function(map) {
    //   if($scope.src != undefined){
    //       $scope.srcNode = $resource('/api/graph/rooms/'+$scope.src).query();
    //       var lat = $scope.srcNode.$promise.$then(function(){return $scope.srcNode._y});
    //       var lon = $scope.srcNode.$promise.$then(function(){return $scope.srcNode._x});
    //       var marker = {
    //         id: Date.now(),
    //         coords: {
    //           latitude: lat,
    //           longitude: lon
    //         }
    //       };
    //       $scope.map.markers.push(marker);
    //       console.log($scope.map.markers);
    //       $scope.$apply();
    //   }
    //
    //   // write a function for $scope.dest as well.
    // }
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
