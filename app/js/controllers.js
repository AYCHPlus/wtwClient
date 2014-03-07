'use strict';

/* Controllers */
(function () {
  var controllers = angular.module('wtwApp.controllers', []);
  
  controllers.controller('ReportCtrl', ['$scope', '$http', '$filter', ReportCtrl]);
  controllers.controller('MyCtrl1', [function() {}]);
  controllers.controller('MyCtrl2', [function() {}]);
  
  function ReportCtrl($scope, $http, $filter) {
    //Return array of days. Each day has a name, and number of forecasts that day.
    function getForecastDays() {
      var days = [];
      var times = $scope.forecastTimes;
      var i, lastDay, currentDay;      
      
      // If report has been received
      if ($scope.availableForecastFreq) {
        for (i = $scope.forecastOffset; i < times.length; ++i) {
          currentDay = $filter('date')(times[i], 'EEE');
          
          // If we are showing this forecast
          if ($scope.shouldShowForecast(i)) {
            if (currentDay !== lastDay) {
              lastDay = currentDay;
              days.push({ name: currentDay, forecastCount: 0 });
            }
            days[days.length - 1].forecastCount++;
          }
        }
      }
      return days;      
    };
    
    function onQuerySuccess(data) {
      $scope.availableForecastFreq = data.forecastFreq;
      $scope.forecastTimes = data.forecastTimes;
      $scope.aheadTimes = data.aheadTimes;
      $scope.forecasts = data.forecasts;
      
      $scope.forecastDays = getForecastDays(); 
    }
    
    // Query weather data for +/- maxDays from now
    function doQuery() {
      var maxDays = 5;
      
      var start = new Date();
      start.setDate(start.getDate() - maxDays);
      
      var end = new Date();
      end.setDate(end.getDate() + maxDays);
      
      var query = 'http://www.vincibleweb.com:3000/wtw/data/json/forecasts?serviceId=1&locationId=1&start=' + start.toJSON() + '&end=' + end.toJSON();
      
      var promise = $http.get(query);    
      promise.success(onQuerySuccess);
    };
    
    $scope.shouldShowAheadTime = function(aheadIndex) {
      var isValidFreq = ((aheadIndex % $scope.aheadFreq) === 0);
      var isLessThanMaxCount = ((aheadIndex / $scope.aheadFreq) < $scope.aheadMaxCount);
      return isValidFreq && isLessThanMaxCount;
    };
    
    $scope.shouldShowForecast = function(forecastIndex) {
      // If forecasts only available every 3 hours, and user has set a forecast frequency of 3 hours,
      // that is an effective forecast frequency of 1 
      var effectiveForecastFreq = $scope.forecastFreq / $scope.availableForecastFreq;
      var effectiveForecastIndex = forecastIndex - $scope.forecastOffset;
      
      var isValidOffset = (forecastIndex >= $scope.forecastOffset);
      
      // Use actual index when testing for valid frequency
      var isValidFreq = ((forecastIndex % effectiveForecastFreq) === 0);
      
      // Take offset into account when calculating maximum
      var isLessThanMaxCount = ((effectiveForecastIndex / effectiveForecastFreq) < $scope.forecastMaxCount);
      
      return isValidOffset && isValidFreq && isLessThanMaxCount;
    };
    
    $scope.onEarlier = function() {
      $scope.forecastOffset -= ($scope.forecastFreq / $scope.availableForecastFreq);
      if ($scope.forecastOffset < 0) {
        $scope.forecastOffset = 0;
      }
    };
    
    $scope.onLater = function() {
      var maxForecastOffset = $scope.forecastTimes.length - 1;
      $scope.forecastOffset += ($scope.forecastFreq / $scope.availableForecastFreq);
      if ($scope.forecastOffset > maxForecastOffset) {
        $scope.forecastOffset = maxForecastOffset;
      }
    };
    
    // If user updates forecast frequency via DOM, need to trigger update of forecastDays,
    // which will in turn trigger DOM update
    // Do not bind result of getForecastDays() directly, as a new array returned each time
    // is counted as a change, resulting in a $digest infinite loop
    $scope.$watch('forecastFreq', function() {
      $scope.forecastDays = getForecastDays();
    });
    
    $scope.$watch('forecastOffset', function() {
      $scope.forecastDays = getForecastDays();
    });
    
    $scope.showTemps = true;
    
    $scope.forecastFreqs = [1, 3, 6, 12, 24];
    $scope.forecastMaxCount = 5;
    $scope.forecastOffset = 0;
    $scope.forecastFreq = 3;
    
    $scope.aheadFreqs = [1, 3, 6, 12, 24];
    $scope.aheadMaxCount = 5;
    $scope.aheadFreq = 3;
    
    doQuery();
  };
}());