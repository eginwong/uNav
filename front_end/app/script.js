   
    var scotchApp = angular.module('scotchApp', ['ngRoute']);

   
    scotchApp.config(function($routeProvider) {
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
                controller  : 'contactController'
            });
    });

    // create the controller and inject Angular's $scope
    scotchApp.controller('mainController', function($scope) {
        // create a message to display in our view
        $scope.message = 'home';

    });

    scotchApp.controller('searchController', function($scope) {
        $scope.message = 'search';
       
    });

    scotchApp.controller('nearyouController', function($scope) {
        $scope.message = 'nearyou';
    });