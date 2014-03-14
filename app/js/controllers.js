'use strict';

/* Controllers */
(function () {
  var controllers = angular.module('wtwApp.controllers', []);
  
  controllers.controller('ReportCtrl', ['$scope', '$http', '$filter', ReportCtrl]);
  controllers.controller('MyCtrl1', [function() {}]);
  controllers.controller('MyCtrl2', [function() {}]);
  
  function ReportCtrl($scope, $http, $filter) {
    var queryReceived = false;
    
    // Change number of columns according to screen width
    function setupMediaQueries() {
      if (window.matchMedia) {
        var smallMq = window.matchMedia("(max-width: 767px)");
        var medMq = window.matchMedia("(min-width: 768px) and (max-width: 1199px)");
        var largeMq = window.matchMedia("(min-width: 1200px)");
        
        var onMediaWidthChange = function (mq) {
          if (smallMq.matches) {
            $scope.forecastMaxCount = 5;
          } else if (medMq.matches) {
            $scope.forecastMaxCount = 7;
          }
          else if (largeMq.matches) {
            $scope.forecastMaxCount = 9;
          }
          
          // If responding to width change after startup, when $digest is not already in progress
          if (mq) {
            $scope.$apply();
          }
        };
        
        smallMq.addListener(onMediaWidthChange);
        medMq.addListener(onMediaWidthChange);
        largeMq.addListener(onMediaWidthChange);
        
        // Call immediately at startup to set correct forecastMaxCount
        onMediaWidthChange();
      } else {
        // TODO: Fallback if matchMedia() not supported
      }
    }
    
    //Return array of days. Each day has a name, and number of forecasts that day.
    function getForecastDays() {
      var days = [];
      var times = $scope.forecastTimes;
      var i, lastDay, currentDay;      
      
      // If report has been received
      if (queryReceived) {
        for (i = 0; i < $scope.forecastIndices.length; ++i) {
          currentDay = $filter('date')(times[$scope.forecastIndices[i]], 'EEE');
          if (currentDay !== lastDay) {
            lastDay = currentDay;
            days.push({ name: currentDay, forecastCount: 0, previousForecastCount: i });
          }
          days[days.length - 1].forecastCount++;
        }
      }
      return days;      
    };
    
    function getForecastIndices() {
      var forecastIndices = [];
      var i;
      
      if (queryReceived) {
        for (i = $scope.forecastOffset; forecastIndices.length < $scope.forecastMaxCount; i += (parseInt($scope.forecastFreq) / $scope.availableForecastFreq)) {
          forecastIndices.push(i);
        }
      }
      
      return forecastIndices;
    };
    
    function getAheadIndices() {
      var aheadIndices = [];
      var i;
      
      for (i = 0; aheadIndices.length < $scope.aheadMaxCount; i += parseInt($scope.aheadFreq)) {
        aheadIndices.push(i);
      }
      
      return aheadIndices;
    };
    
    function onForecastQuerySuccess(data) {
      $scope.availableForecastFreq = data.forecastFreq;
      $scope.forecastTimes = data.forecastTimes;
      $scope.aheadTimes = data.aheadTimes;
      $scope.forecasts = data.forecasts;
      queryReceived = true;

      $scope.forecastIndices = getForecastIndices();
      $scope.aheadIndices = getAheadIndices();
      $scope.forecastDays = getForecastDays();
    }
    
    // Query weather data for +/- maxDays from now
    function doForecastQuery() {
      var maxDays = 5;
      
      var start = new Date();
      start.setDate(start.getDate() - maxDays);
      
      var end = new Date();
      end.setDate(end.getDate() + maxDays);
      
      var query = 'http://www.vincibleweb.com:3000/wtw/data/json/forecasts?serviceId=1&locationId=1&start=' + start.toJSON() + '&end=' + end.toJSON();
      
      var promise = $http.get(query);    
      promise.success(onForecastQuerySuccess);
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
    
    $scope.onLess = function () {
      $scope.forecastMaxCount--;
    };
    
    $scope.onMore = function () {
      $scope.forecastMaxCount++;
    };
    
    $scope.getCellStyle = function(cell) {
      var translation = 'translate3d(' + (cell.col * 5) + 'rem, ' + (cell.row * 5) + 'rem, 0rem)';
      var transform = {
        'transform': translation,
        '-webkit-transform': translation
      };
      if (cell.colspan) {
        transform.width = (cell.colspan * 5) + 'rem';
      }
        
      return transform;
    };
    
    $scope.getLayoutStyle = function(cell) {
      
      // Day and time rows half height
      function getEffeciveRow(realRow) {
        var effectiveRow = 0;
        
        switch (realRow) {
        case 0:
          break;
          
        case 1:
          effectiveRow = 0.5;
          break;
          
        default:
          effectiveRow = realRow - 1;
        }
        
        return effectiveRow;
      }
      
      var transform = {};
      var colCount = $scope.forecastMaxCount + 1; // For ahead column
      var rowCount = $scope.aheadMaxCount + 1; // Day and time rows half height
      
      transform.left = ((cell.col / colCount) * 100) + '%';
      transform.top = ((getEffeciveRow(cell.row) / rowCount) * 100) + '%';

      if (cell.colspan) {
        transform.width = ((cell.colspan / colCount) * 100) + '%';
      }
      else
      {
        transform.width = ((1 / colCount) * 100) + '%';
      }
      
      transform.height = ((1 / rowCount) * 100) + '%';
        
      return transform;
    };
    
    // If user updates forecast frequency via DOM, need to trigger update of forecastDays,
    // which will in turn trigger DOM update
    // Do not bind result of getForecastDays() directly, as a new array returned each time
    // is counted as a change, resulting in a $digest infinite loop
    $scope.$watch('forecastFreq', function() {
      $scope.forecastIndices = getForecastIndices();
      $scope.forecastDays = getForecastDays();
    });
    
    $scope.$watch('forecastOffset', function() {
      $scope.forecastIndices = getForecastIndices();
      $scope.forecastDays = getForecastDays();
    });
    
    $scope.$watch('aheadFreq', function() {
      $scope.aheadIndices = getAheadIndices();
    });
    
    $scope.$watch('forecastMaxCount', function() {
      $scope.forecastIndices = getForecastIndices();
      $scope.forecastDays = getForecastDays();
    });
    
    $scope.showTemps = true;
    
    $scope.forecastFreqs = [1, 3, 6, 12, 24];
    $scope.forecastMaxCount = 5;
    $scope.forecastOffset = 0;
    $scope.forecastFreq = 6;
    $scope.forecastIndices = [];
    
    $scope.aheadFreqs = [1, 3, 6, 12, 24];
    $scope.aheadMaxCount = 5;
    $scope.aheadFreq = 3;
    $scope.aheadIndices = [];
    
    setupMediaQueries();
    doForecastQuery();
  };
}());