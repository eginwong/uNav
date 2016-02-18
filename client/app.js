var uNav = angular.module('uNav', ['ui', 'ui.utils', 'ngRoute', 'ui.bootstrap', 'uiGmapgoogle-maps']).
config(function($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider) {
  $locationProvider.hashPrefix('');
  $routeProvider.
  when('/home', { templateUrl : 'app/partials/home.html', controller  : 'mainController'}).
  when('/search', {templateUrl : 'app/partials/search.html', controller  : 'searchController'}).
  when('/navigation', {templateUrl : 'app/partials/navigation.html', controller  : 'navController'}).
  when('/nearyou', { templateUrl : 'app/partials/nearyou.html', controller  : 'nearyouController'}).
  when('/about', { templateUrl : 'app/partials/about.html'}).
  when('/support', { templateUrl : 'app/partials/support.html'});

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

uNav.controller('searchController', function($scope, $location, sharedProperties) {
  $scope.message = 'search';
  // throw this to the backend so you don't have to keep querying each time!
  $.getJSON('/api/buildings/', function(data) {
    $('#rooms').append($('<option/>').attr("value", "").text(""));
    $.each(data, function(i, val) {
      if(i != 0) {
        $('#rooms').append($('<option/>').attr("value", val[0]).text(val[0] + " - " + val[1]));
      }
    });
    $(".chosen-select").chosen({
      no_results_text: "Oops, nothing found!",
      width: "95%"
    });
  });

  // Store value in between controllers. And redirect to new page.
  $('#rooms').change(function() {
    sharedProperties.setString($("#rooms option:selected").val());
    $location.path('/navigation');
    $scope.$apply();
  });
});

uNav.controller('nearyouController', function($scope) {
  $scope.message = 'nearyou';
});

uNav.controller('navController', function($scope, sharedProperties, uiGmapGoogleMapApi) {
  // dynamically set the map based on which building we're grabbing it from - take from uwapi
  $scope.map = { center: { latitude: 43.47035091238624, longitude: -80.54049253463745 }, zoom: 20 };
  $scope.message = 'navigation';
  var mapImage = sharedProperties.getString();
  $('#buildingmap').attr("src", "images/Waterloo Floor Plans/"+mapImage+"1.png");

  $.getJSON('/api/graph/rooms', function(data) {
    $('.specRooms').append($('<option/>').attr("value", "").text(""));
    $.each(data, function(i, val) {
      if(i != 0) {
        $('.specRooms').append($('<option/>').attr("value", val).text(val));
      }
    });
    $(".chosen-select").chosen({
      no_results_text: "Oops, nothing found!",
      width: "95%"
    });
  });

  // Do stuff with your $scope.
  // Note: Some of the directives require at least something to be defined originally!
  // e.g. $scope.markers = []

  // uiGmapGoogleMapApi is a promise.
  // The "then" callback function provides the google.maps object.
  uiGmapGoogleMapApi.then(function(maps) {
    //   map.data.setStyle(function(feature) {
    //     console.log(feature);
    //     switch (feature.getProperty('utility')) {
    //       case "Stairs":
    //       var icon = {
    //         url: "demos/stairs.jpg",
    //         scaledSize: new google.maps.Size(25, 25)
    //       };
    //       return {icon:icon};
    //       case "WC":
    //       var icon = {
    //         url: "demos/WC.jpg",
    //         scaledSize: new google.maps.Size(25, 25)
    //       };
    //       return {icon: icon};
    //       case "Hallway":
    //     }
    //   });
    //   map.data.loadGeoJson('/api/demo3/');
    // }
  });
});
