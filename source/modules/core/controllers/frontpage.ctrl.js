(function() {
    'use strict';
    angular.module('dlabsApp')
        .controller('FrontpageCtrl', ['$scope', 'localStorageService',
            function($scope, localStorageService) {
                console.log("FrontpageCtrl");
            }
        ])
})();
