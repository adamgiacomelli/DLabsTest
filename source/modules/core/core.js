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
            'ngWebSocket',
            'ng-showdown'
        ])
        .run(
            ['$rootScope',
                function($rootScope) {}
            ]);
})();
