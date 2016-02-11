var uNav = angular.module('uNav', ['ui', 'ui.utils', 'ngRoute', 'ui.bootstrap']);
uNav.config(function($routeProvider) {
  $routeProvider

  // route for the home page
  .when('/home', {
    templateUrl : 'app/partials/home.html',
    controller  : 'mainController'
  })

  // route for the about page
  .when('/search', {
    templateUrl : 'app/partials/search.html',
    controller  : 'searchController'
  })

  // route for the nearyou page
  .when('/nearyou', {
    templateUrl : 'app/partials/nearyou.html',
    controller  : 'nearyouController'
  })

  .when('/about', {
    templateUrl : 'app/partials/about.html',
    controller  : 'aboutController'
  })

  .when('/support', {
    templateUrl : 'app/partials/support.html',
    controller  : 'supportController'
  });
});

// create the controller and inject Angular's $scope
uNav.controller('mainController', function($scope) {
  // create a message to display in our view
  $scope.message = 'home';
});

uNav.controller('searchController', function($scope) {
  $scope.message = 'search';
  // throw this to the backend so you don't have to keep querying each time!
  var uw_buildings = $.getJSON('/api/buildings/', function(data) {
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
});

uNav.controller('nearyouController', function($scope) {
  $scope.message = 'nearyou';
});

uNav.controller('aboutController', function($scope) {
  $scope.message = 'about';
});

uNav.controller('supportController', function($scope) {
  $scope.message = 'support';
});
