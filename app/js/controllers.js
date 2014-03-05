'use strict';

/* Controllers */
(function () {
  var controllers = angular.module('wtwApp.controllers', []);
  
  controllers.controller('ReportCtrl', ['$scope', '$http', '$filter', ReportCtrl]);
  controllers.controller('MyCtrl1', [function() {}]);
  controllers.controller('MyCtrl2', [function() {}]);
  
  function ReportCtrl($scope, $http, $filter) {
    var promise = $http.get('http://desktop:3000/wtw/data/json/forecasts?serviceId=1&locationId=1&start=2014-03-03T12:00:00.000Z&end=2014-03-05T12:00:00.000Z');
    promise.success(function (data) {
      $scope.availableForecastFreq = data.forecastFreq;
      $scope.forecastTimes = data.forecastTimes;
      $scope.aheadTimes = data.aheadTimes;
      $scope.forecasts = data.forecasts;
      
      $scope.forecastDays = getForecastDays(); 
    });
    
    // Return array of days. Each day has a name, and number of forecasts that day.
    function getForecastDays() {
      var days = [];
      var times = $scope.forecastTimes;
      var i, lastDay, currentDay;      
      
      // If report has been received
      if ($scope.availableForecastFreq) {
        for (i = 0; i < times.length; i += ($scope.forecastFreq / $scope.availableForecastFreq)) {
          currentDay = $filter('date')(times[i], 'EEE');
          if (currentDay !== lastDay) {
            lastDay = currentDay;
            days.push({ name: currentDay, forecastCount: 0 });
          }
          days[days.length - 1].forecastCount++;
        }
      }
      return days;      
    };
    
    // If user updates forecast frequency via DOM, need to trigger update of forecastDays,
    // which will in turn trigger DOM update
    $scope.$watch('forecastFreq', function() {
      $scope.forecastDays = getForecastDays();
    });
    
    $scope.showTemps = true;
    
    $scope.forecastFreqs = [1, 3, 6, 12, 24];
    $scope.forecastFreq = 3;
    
    $scope.aheadFreqs = [1, 3, 6, 12, 24];    
    $scope.aheadFreq = 3;
  };
}());