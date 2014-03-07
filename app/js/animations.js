'use strict';

/* Animation module */
(function () {
  
  
  var module = angular.module('wtwApp.animations', ['ngAnimate']);
  
  module.animation('.forecast-animation', function() {
    var duration = 600;
    var easing = "easeInOutQuad";
    
    return {
      enter: function(element, done) {
        element.css({
          'opacity': '0',
          'width': '0',
          'max-width': '0'
        });
        
        function animateEnter() {
          $(element).animate({
            'width': '5rem',
            'max-width': '5rem'
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
          'width': '5rem',
          'max-width': '5rem'
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
}());