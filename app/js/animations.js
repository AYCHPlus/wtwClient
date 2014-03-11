'use strict';

/* Animation module */
(function () {
  
  
  var module = angular.module('wtwApp.animations', ['ngAnimate']);
  
  module.animation('.forecast-animation', function() {
    var duration = 600;
    var easing = 'easeInOutQuad';
    var colWidth = '80px';
    
    return {
      enter: function(element, done) {
        element.css({
          'opacity': '0',
          'width': '0',
          'max-width': '0'
        });
        
        function animateEnter() {
          $(element).animate({
            'width': colWidth,
            'max-width': colWidth
          }, duration, easing, function() {
            $(element).animate({
              'opacity': '1'
            }, duration, easing, done);
          });          
        };
        
        // Delay start so that width changes for enter and leave happen
        // simultaneously, preserving table width
        setTimeout(animateEnter, duration);        
      },
      
      leave: function(element, done) {
        element.css({
          'opacity': '1',
          'width': colWidth,
          'max-width': colWidth
        });
        $(element).animate({
          'opacity': '0'
        }, duration, easing, function() {
          $(element).animate({
            'width': '0',
            'max-width': '0'
          }, duration, easing, done);
        });
      },
      
      move: function(element, done) {
        done();
      }
    };
  });
  
  module.animation('.forecast', function() {
    return {
      enter: function(element, done) {
        done();
      },
      
      leave: function(element, done) {
        done();
      },
      
      move: function(element, done) {
        done();
      }
    };
  });
}());