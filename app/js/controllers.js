'use strict';

/* Controllers */
(function () {
  var controllers = angular.module('wtwApp.controllers', []);
  
  controllers.controller('ReportCtrl', ['$scope', '$http', '$filter', '$window', ReportCtrl]);
  controllers.controller('MyCtrl1', [function() {}]);
  controllers.controller('MyCtrl2', [function() {}]);
  
  function ReportCtrl($scope, $http, $filter, $window) {
    var queryReceived = false;
    
    function setForecastCountFromWindowWidth() {
      var width = $($window).width();
      if (width < 500) {
        $scope.forecastMaxCount = 5;
      } else if (width > 900) {
        $scope.forecastMaxCount = 9;
      } else {
        $scope.forecastMaxCount = Math.floor(width / 100);
      }       
    };
    
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
    
    $scope.getLayoutStyle = function(cell) {
      var showTempsHeightFactor = 1.25;
      
       // Day and time rows half height
      function getRowHeight(colWidth) {
        var rowHeight = colWidth;
        
        switch (cell.row) {
        case 0:
        case 1:
          rowHeight /= 2;
          break;
            
        default:
          if ($scope.showTemps) {
            rowHeight *= showTempsHeightFactor;
          }
          break;
        }
        
        // Ensure integer pixels, to prevent sub-pixel blurring
        return Math.round(rowHeight);
      };
      
      // Day and time rows half height
      function getTranslateY(colWidth) {
        var translateY = 0;
        var baseRowHeight = colWidth;
        var forecastRowHeight = baseRowHeight * ($scope.showTemps ? showTempsHeightFactor : 1);
        
        switch (cell.row) {
        case 0:
          break;
          
        case 1:
          translateY = colWidth / 2;
          break;
          
        default:
          translateY = baseRowHeight + ((cell.row - 2) * forecastRowHeight);
        }
        
        // Ensure integer pixels, to prevent sub-pixel blurring
        return Math.round(translateY);
      };
      
      var transform = {};
      var colCount = $scope.forecastMaxCount + 1; // For ahead column
      var tableWidth = $('#forecast-table').outerWidth();

      // Ensure integer pixels, to prevent sub-pixel blurring
      var colWidth = Math.round(tableWidth / colCount);
      
      var translateX = cell.col * colWidth;
      var translateY = getTranslateY(colWidth);
      var translate3d;
      
      var width;
      var height;
      
      translate3d = 'translate3d(' + translateX + 'px, ' + translateY + 'px, ' + '0px)';
      
      transform['transform'] = translate3d;
      transform['-webkit-transform'] = translate3d;
      
      width = colWidth * (cell.colspan || 1);
      height = getRowHeight(colWidth);
  
      transform.width = width + 'px';
      transform.height = height + 'px';
      
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
    $scope.aheadMaxCount = 9;
    $scope.aheadFreq = 3;
    $scope.aheadIndices = [];
    
    // Ensure cells are repositioned on every window resize
    angular.element($window).bind('resize', function() {
      setForecastCountFromWindowWidth();
      $scope.$apply();
    });
    setForecastCountFromWindowWidth();
    
    doForecastQuery();
  };
}());