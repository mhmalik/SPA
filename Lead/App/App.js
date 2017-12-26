var myApp = angular.module('AngularAuthApp',
    ['ngRoute', 'LocalStorageModule', 'jcs-autoValidate', ]);

myApp.config(function ($routeProvider) {
    var url = "/LeadApp";
    //Produciton
    //var url = "/Lead";
    //var url = "";

    $routeProvider.when("/Lead", {
        controller: "LeadController",
        templateUrl: url + "/App/Views/Lead.html"
    });

    $routeProvider.otherwise({ redirectTo: "/Lead" });
});

//Test
var serviceBase = 'ServiceUrl';
var AccountsUrl = 'UserAccountUrl';
var LeadUrl = 'CreateReqUrl';
var BusinessUrl = 'BusinessAccountsUrl';

//Local
var AppUrl = 'http://192.168.25.106/AteaAll/Default.html';

myApp.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'ngAuthApp'
});

myApp.factory('Url', function () {
    return {
        UrlValue: function () {
            return "/LeadApp";
            //Production
            //return "/Lead";
        }
    }
});
myApp.factory('AppUrl', function () {
    return {
        getUrl: function () {
            return AppUrl;
        }
    }
});

myApp.factory('GetAccounts', function () {
    return {
        getUrl: function () {
            return AccountsUrl;
        }
    }
});
myApp.factory('CreateLead', function () {
    return {
        getUrl: function () {
            return LeadUrl;
        },
        getBusinessUrl: function () {
            return BusinessUrl;
        }
    }
});