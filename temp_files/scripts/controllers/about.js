'use strict';

/**
 * @ngdoc function
 * @name newprojectApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the newprojectApp
 */
angular.module('newprojectApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
