  var uNav = angular.module('uNav', ['ngRoute']);


    uNav.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/home', {
                templateUrl : 'pages/home.html',
                controller  : 'mainController'
            })

            // route for the about page
            .when('/search', {
                templateUrl : 'pages/search.html',
                controller  : 'searchController'
            })

            // route for the nearyou page
            .when('/nearyou', {
                templateUrl : 'pages/nearyou.html',
                controller  : 'nearyouController'
            });
    });

    // create the controller and inject Angular's $scope
    uNav.controller('mainController', function($scope) {
        // create a message to display in our view
        $scope.message = 'home';

    });

    uNav.controller('searchController', function($scope) {
        $scope.message = 'search';
    });

    uNav.controller('nearyouController', function($scope) {
        $scope.message = 'nearyou';
    });
