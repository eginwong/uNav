var uNav = angular.module('uNav', ['ui', 'ui.utils', 'ngRoute', 'ui.bootstrap', 'uiGmapgoogle-maps', 'ngResource', 'localytics.directives']).
config(function($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider) {
  $locationProvider.hashPrefix('');
  $routeProvider.
  when('/home', { templateUrl : 'app/partials/home.html', controller  : 'mainController'}).
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
  $scope.message = 'home';
});

uNav.controller('searchController', function($scope, $resource, $location, sharedProperties) {
  $scope.message = 'search';
  // throw this to the backend so you don't have to keep querying each time!
  $scope.buildings = $resource('/api/buildings').query();

  // Store value in between controllers. And redirect to new page.
  $scope.store = function() {
    sharedProperties.setString($scope.buildOfChoice[0]);
    $location.path('/navigation');
    $scope.$apply();
  }
});

uNav.controller('nearyouController', function($scope) {
  $scope.message = 'nearyou';
});

uNav.controller('navController', function($scope, $resource, sharedProperties, uiGmapGoogleMapApi) {
  // dynamically set the map based on which building we're grabbing it from - take from uwapi
  $scope.map = { center: { latitude: 43.47035091238624, longitude: -80.54049253463745 }, zoom: 20 };
  $scope.message = 'navigation';
  var mapImage = sharedProperties.getString();
  $('#buildingmap').attr("src", "images/Waterloo Floor Plans/"+mapImage+"1.png");

  $scope.rooms = $resource('/api/graph/rooms').query();

  // Do stuff with your $scope.
  // Note: Some of the directives require at least something to be defined originally!
  // e.g. $scope.markers = []

  // uiGmapGoogleMapApi is a promise.
  // The "then" callback function provides the google.maps object.
  $scope.update = function() {
    if($scope.src != undefined && $scope.dest != undefined){
      alert($scope.src + " to " + $scope.dest);
    }
 }

  uiGmapGoogleMapApi.then(function(maps) {

  });
});

uNav.directive('chosen', function($timeout) {

  var linker = function(scope, element, attr) {

    $timeout(function () {
      element.chosen();
    }, 200, false);
  };

  return {
    restrict: 'A',
    link: linker
  };
});

uNav.controller('nearyouController', ['$scope', function($scope) {
    $scope.myFirstFunction = function(msg) {
         alert(msg + '!!! first function call!');   
    };
    $scope.mySecondFunction = function(msg) {
         alert(msg + '!!! second function call!');   
    };
}]);

