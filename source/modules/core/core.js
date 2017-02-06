(function() {
    'use strict';
    angular.module('dlabsApp', [
            'ngResource',
            'ui.router',
            'ngMaterial', //Material design libs
            'ngMdIcons',
            'LocalStorageModule',
            'datetime',
            'textAngular'
        ])
        .run(
            ['$rootScope',
                function($rootScope) {
                    console.log("CORE");
                }
            ]);
})();
