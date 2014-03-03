'use strict';

/* Controllers */
(function () {
  var controllers = angular.module('wtwApp.controllers', []);
  
  controllers.controller('ReportCtrl', ['$scope', '$http', ReportCtrl]);
  controllers.controller('MyCtrl1', [function() {}]);
  controllers.controller('MyCtrl2', [function() {}]);
  
  function ReportCtrl($scope, $http) {
    var promise = $http.get('http://localhost:3000/wtw/data/json/forecasts?serviceId=1&locationId=1&start=2014-03-03T00:00:00.000Z&end=2014-03-05T00:00:00.000Z');
    promise.success(function (data) {
      $scope.forecastTimes = data.forecastTimes;
      $scope.aheadTimes = data.aheadTimes;
      $scope.forecasts = data.forecasts;
    });
    
    $scope.name = "World";
  };
}());