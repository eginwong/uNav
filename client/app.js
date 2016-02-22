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
    v: '3.20', //defaults to latest 3.X anyhow
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

uNav.controller('nearyouController', function($scope, $timeout, $location) {
  $scope.message = 'nearyou';

  // $scope.enableEditor = function() {
  //   $location.path('/about');
  //   $timeout(function(empty) {
  //     $scope.$apply();
  //   },0);
  // }
});

uNav.controller('navController', function($scope, $resource, sharedProperties, uiGmapGoogleMapApi, uiGmapIsReady) {
  // dynamically set the map based on which building we're grabbing it from - take from uwapi
  $scope.message = 'navigation';
  var mapImage = sharedProperties.getString();
  $('#buildingmap').attr("src", "images/Waterloo Floor Plans/"+mapImage+"1.png");

  $scope.rooms = $resource('/api/graph/rooms').query();


  // uiGmapGoogleMapApi is a promise.
  // The "then" callback function provides the google.maps object.
  $scope.update = function() {
    if($scope.src != undefined && $scope.dest != undefined){
      alert($scope.src + " to " + $scope.dest);
      // Do stuff with your $scope.
      // Note: Some of the directives require at least something to be defined originally!
      // e.g. $scope.markers = []
    }
  }

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
              control: {},
              events: {
                  tilesloaded: function (maps, eventName, args) {},
                  dragend: function (maps, eventName, args) {},
                  zoom_changed: function (maps, eventName, args) {}
              }
          };
      });

      $scope.windowOptions = {
          show: false
      };

      $scope.onClick = function (data) {
          $scope.windowOptions.show = !$scope.windowOptions.show;
          console.log('$scope.windowOptions.show: ', $scope.windowOptions.show);
          console.log('This is a ' + data);
          //alert('This is a ' + data);
      };

      $scope.closeClick = function () {
          $scope.windowOptions.show = false;
      };

      $scope.title = "Window Title!";

      uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
      .then(function (instances) {
          console.log(instances[0].map); // get the current map
      })
          .then(function () {
          $scope.addMarkerClickFunction($scope.markers);
      });

      $scope.markers = [{
          id: 0,
          coords: {
              latitude: 37.7749295,
              longitude: -122.4194155
          },
          data: 'restaurant'
      }, {
          id: 1,
          coords: {
              latitude: 37.79,
              longitude: -122.42
          },
          data: 'house'
      }, {
          id: 2,
          coords: {
              latitude: 37.77,
              longitude: -122.41
          },
          data: 'hotel'
      }];

      $scope.addMarkerClickFunction = function (markersArray) {
          angular.forEach(markersArray, function (value, key) {
              value.onClick = function () {
                  $scope.onClick(value.data);
                  $scope.MapOptions.markers.selected = value;
              };
          });
      };


      // $scope.MapOptions = {
      //     minZoom: 3,
      //     zoomControl: false,
      //     draggable: true,
      //     navigationControl: false,
      //     mapTypeControl: false,
      //     scaleControl: false,
      //     streetViewControl: false,
      //     disableDoubleClickZoom: false,
      //     keyboardShortcuts: true,
      //     markers: {
      //         selected: {}
      //     },
      //     {styles: [{
      //       stylers: [{
      //         hue: "#00ffe6" },{ saturation: -20 }]
      //       },{featureType: "road", elementType: "geometry", stylers: [{ lightness: 100 },{ visibility: "simplified" }]},{featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ]}]}
      //     styles: [{
      //         featureType: "poi",
      //         elementType: "labels",
      //         stylers: [{
      //             visibility: "off"
      //         }]
      //     }, {
      //         featureType: "transit",
      //         elementType: "all",
      //         stylers: [{
      //             visibility: "off"
      //         }]
      //     }],
      // };
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


