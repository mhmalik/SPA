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
var serviceBase = 'http://apitest.atea.dk/LeadAppService/';
var AccountsUrl = 'http://apitest.atea.dk/LeadAppService/api/AccountbyID?query=';
var LeadUrl = 'http://apitest.atea.dk/lead/lgservicegateway.svc/CreateLead/';
var BusinessUrl = 'https://apitest.atea.dk/lead/lgservicegateway.svc/GetBusinessAreas/';
var AppUrl = 'http://apitest.atea.dk/AteaAll/Default.html';

//Production
//var serviceBase = 'https://mobile.atea.com/LeadService/';
//var AppUrl = 'https://mobile.atea.com/AteaAll/Default.html';
//var AccountsUrl = 'https://mobile.atea.com/LeadService/api/AccountbyID?query=';
//var LeadUrl = 'https://mobile.atea.com/Lead/Service/LGServiceGateway.svc/CreateLead/';
//var BusinessUrl = 'https://apitest.atea.dk/lead/lgservicegateway.svc/GetBusinessAreas/';

//Local
//var AppUrl = 'http://192.168.25.105/AteaAll/Default.html';

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