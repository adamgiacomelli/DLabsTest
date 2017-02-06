(function() {
    'use strict';
    angular.module('dlabsApp', [
            'ngResource',
            'ui.router',
            'ngMaterial', //Material design libs
            'ngMdIcons',
            'LocalStorageModule',
            'datetime',
            'angular-uuid',
            'ngWebSocket'
        ])
        .run(
            ['$rootScope',
                function($rootScope) {}
            ]);
})();
