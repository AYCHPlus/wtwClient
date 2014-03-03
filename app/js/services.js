'use strict';

/* Services */
(function() {
  var services = angular.module('wtwApp.services', []);
  
  //Demonstrate how to register services
  //In this case it is a simple value service.
  services.value('version', '0.1');
}());


