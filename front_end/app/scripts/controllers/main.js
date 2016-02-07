'use strict';

/**
 * @ngdoc function
 * @name polymerStarterKitApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the polymerStarterKitApp
 */
angular.module('polymerStarterKitApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
