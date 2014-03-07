'use strict';


// Declare app level module which depends on filters, and services
angular.module('wtwApp', [
  'ngRoute',
  'wtwApp.filters',
  'wtwApp.services',
  'wtwApp.directives',
  'wtwApp.controllers',
  'wtwApp.animations'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/report', {templateUrl: 'partials/report.html', controller: 'ReportCtrl'});
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/report'});
}]);
