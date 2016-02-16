var uNav = angular.module('uNav', ['ui', 'ui.utils', 'ngRoute', 'ui.bootstrap']).
config(function($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix('');
  $routeProvider.
  when('/home', { templateUrl : 'app/partials/home.html', controller  : 'mainController'}).
  when('/search', {templateUrl : 'app/partials/search.html', controller  : 'searchController'}).
  when('/navigation', {templateUrl : 'app/partials/navigation.html', controller  : 'navController'}).
  when('/nearyou', { templateUrl : 'app/partials/nearyou.html', controller  : 'nearyouController'}).
  when('/about', { templateUrl : 'app/partials/about.html'}).
  when('/support', { templateUrl : 'app/partials/support.html'})
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
  var uw_buildings = $.getJSON('/api/buildings/', function(data) {
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
uNav.controller('navController', function($scope, sharedProperties) {
  $scope.message = 'navigation';
  var mapImage = sharedProperties.getString();
  $('#buildingmap').attr("src", "images/Waterloo Floor Plans/"+mapImage+"1.png");
});
