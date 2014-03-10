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
  $routeProvider.when('/table', {templateUrl: 'partials/table.html', controller: 'ReportCtrl'});
  $routeProvider.when('/div', {templateUrl: 'partials/div.html', controller: 'ReportCtrl'});
  //$routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/table'});
}]);
