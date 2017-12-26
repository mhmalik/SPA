var myApp = angular.module('AngularAuthApp');
myApp.run(function (defaultErrorMessageResolver) {
    defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
        errorMessages['ContactPerson'] = 'Indtast venligst kontaktperson';
        errorMessages['ContactNumber'] = 'Indtast venligst kontaktnummer';
        errorMessages['ContactEmail'] = 'Indtast venligst email';
        errorMessages['badEmail'] = 'Indtast venligst gyldig email';
        errorMessages['Title'] = 'Indtast venligst Titel';
        errorMessages['Desc'] = 'Indtast venligst en beskrivelse';
        //errorMessages['LessNo'] = 'You must be enter greater than 8 digits';
        //errorMessages['GreaterNo'] = 'You must be enter less than 20 digits';
    });
});

myApp.controller('LeadController', ['$scope', '$rootScope', '$http', 'localStorageService', 'authService', '$location', '$window', 'Url', 'AppUrl', 'GetAccounts', 'CreateLead',
function ($scope, $rootScope, $http, localStorageService, authService, $location, $window, Url, AppUrl, GetAccounts, CreateLead) {

    var getLoader = function () {
        var loader = new BootstrapDialog({
            message: function (dialogRef) {
                var $message = $('<div class="loader" ng-transclude></div>' +
                    '<div class="col-xs-12"><p class="loader_text">Indlæser, vent venligst…</p></div');
                return $message;
            },
            closable: false
        });
        loader.realize();
        loader.getModalHeader().hide();
        loader.getModalFooter().hide();
        loader.getModalBody().css('background-color', '#fff');
        loader.getModalBody().css('color', '#000');
        loader.open();
        return loader;
    }

    $scope.toggleObject = 1;
    $scope.selectedAccount = "";
    $scope.NoRec = true;
    $scope.BackImg = false;
    $scope.ManagerInitial = "";
    $scope.accounts = [];
    $scope.LeadData = {
        AccountId: "",
        AccountName: "",
        AccountNumber: "",
        PostalCode: "",
        //AccountManagerId: "",
        BusinessAreaId: "",
        ContactName: "",
        ContactPhone: "",
        ContactEmail: "",
        Subject: "",
        Description: "",
        Submitter: "",
        Permission: false
    };

    $scope.businessAtea = { text: 'Select Business Area', value: '' };
    $scope.selectedBusiness = {};
    $scope.businessAteaData = [];

    $scope.AppUrl = AppUrl.getUrl();
    //AccountsUrl
    $scope.AccountsUrl = GetAccounts.getUrl();
    //CreateLead Url
    $scope.LeadUrl = CreateLead.getUrl();

    //Get User Data
    if ($location.url().indexOf("?") > -1) {
        $scope.loader = getLoader();
        var urll = $location.url().split('?')[0];
        var user = (CryptoJS.AES.decrypt($location.$$search.User, "/")).toString(CryptoJS.enc.Utf8);
        var pwd = (CryptoJS.AES.decrypt($location.$$search.pwd, "/")).toString(CryptoJS.enc.Utf8);
        var userInitials = {
            password: pwd,
            userName: user
        };
        $location.search('User', null);
        $location.search('pwd', null);
        authService.login(userInitials).then(function (response) {
            localStorageService.set('LoginDataLS', response);
            localStorageService.set('userInitials', userInitials);
            $scope.loader.close();
        });
        urll = '';
    }

    businessData();

    $scope.onBusinessClick = function (data) {
        if (data.value != "No Record Found") {
            $scope.businessAtea = data;
        }
    }

    function businessData() {
        $http({
            url: CreateLead.getBusinessUrl(),
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data) {
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    $scope.businessAteaData[i] = { text: data[i].DisplayName, value: data[i].BusinessAreaId };
                }
            }
            else $scope.businessAteaData[0] = { text: "No Record Found", value: "No Record Found" };
        }).error(function (data) {
            console.log(data);
        });
    }

    function showAlert(message) {
        var dialog = new BootstrapDialog({
            message: message,
            buttons: [{
                id: 'btn-1',
                label: 'OK',
                cssClass: 'button_okay'
            }]
        });
        dialog.defaultOptions.animate = false;
        dialog.defaultOptions.closable = false;
        dialog.realize();
        dialog.getModalHeader().hide();
        dialog.setSize(BootstrapDialog.SIZE_SMALL);
        var btn1 = dialog.getButton('btn-1');
        btn1.click(function (event) {
            dialog.close();
        });
        dialog.open();
    };

    function checkBoxAlert(message) {
        var dialog = new BootstrapDialog({
            message: message,
            buttons: [{
                id: 'btn-confirm',
                label: 'Ja',
                cssClass: 'button_okay'
            }, {
                id: 'btn-cancel',
                label: 'Nej',
                cssClass: 'button_cancel'
            }]
        });
        //dialog.removeClass('fade');
        dialog.defaultOptions.animate = false
        dialog.defaultOptions.closable = false;
        dialog.realize();
        dialog.getModalHeader().hide();
        dialog.setSize(BootstrapDialog.SIZE_SMALL);
        var btnconfirm = dialog.getButton('btn-confirm');
        var btncancel = dialog.getButton('btn-cancel');
        btncancel.click(function (event) {
            $rootScope.$evalAsync(function () {
                $scope.LeadData.Permission = false;
            });
            dialog.close();
        });
        btnconfirm.click(function (event) {
            $rootScope.$evalAsync(function () {
                $scope.LeadData.Permission = true;
                if ($scope.form.$valid)
                    $scope.Toggle(3);
            });
            dialog.close();
        });
        dialog.open();
    };

    function showSubmitAlert(message) {
        var dialog = new BootstrapDialog({
            message: message,
            buttons: [{
                id: 'btn-confirm',
                label: 'Ja',
                cssClass: 'button_okay'
            }, {
                id: 'btn-cancel',
                label: 'Nej',
                cssClass: 'button_cancel'
            }]
        });
        dialog.realize();
        dialog.defaultOptions.animate = false;
        dialog.defaultOptions.closable = false;
        dialog.getModalHeader().hide();
        dialog.setSize(BootstrapDialog.SIZE_SMALL);
        var btnconfirm = dialog.getButton('btn-confirm');
        var btncancel = dialog.getButton('btn-cancel');
        btncancel.click(function (event) {
            dialog.close();
        });
        btnconfirm.click(function (event) {
            $rootScope.$evalAsync(function () {
                //Submit Call
                formSubmission();
            });
            dialog.close();
        });
        dialog.open();
    };

    function formSubmission() {
        if ($scope.LeadData.Subject != "" && $scope.LeadData.Description != "") {
            $scope.loader = getLoader();
            $scope.loader.open();
            var Ldata = {
                dic: [{
                    AccountId: "",//$scope.selectedAccount.CustomerId,
                    AccountName: $scope.selectedAccount.Name == undefined ? "" : $scope.selectedAccount.Name,
                    AccountNumber: $scope.selectedAccount.CustomerId == undefined ? "" : $scope.selectedAccount.CustomerId,
                    PostalCode: $scope.selectedAccount.PostalCode == undefined ? "" : $scope.selectedAccount.PostalCode,
                    //AccountManagerId: $scope.ManagerInitial,
                    BusinessAreaId: $scope.businessAtea.value,
                    ContactName: $scope.LeadData.ContactName,
                    ContactPhone: $scope.LeadData.ContactPhone,
                    ContactEmail: $scope.LeadData.ContactEmail,
                    Subject: $scope.LeadData.Subject,
                    Description: $scope.LeadData.Description,
                    Submitter: localStorageService.get('LoginDataLS').userName,
                    SendPermissionRequest: $scope.LeadData.Permission
                }]
            }
            var jsonData = angular.toJson(Ldata);
            $http({
                url: LeadUrl,
                method: "POST",
                data: jsonData,
                crossDomain: true,
                dataType: 'jsonp',
                //data: $.param(objectToSerialize),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                $scope.returndata = data;
                if (data["Message"] == "Saved Successfully") {
                    $scope.Toggle(4);
                    $scope.LeadData = {
                        AccountId: "",
                        AccountName: "",
                        AccountNumber: "",
                        PostalCode: "",
                        //AccountManagerId: "",
                        BusinessAreaId: "",
                        ContactName: "",
                        ContactPhone: "",
                        ContactEmail: "",
                        Subject: "",
                        Description: "",
                        Submitter: "",
                        Permission: false
                    };
                    $scope.loader.close();
                }
                else {
                    showAlert('Noget gik galt. Forsøg venligst igensenere');
                    $scope.loader.close();
                }
            }).error(function (data, status) {
                console.error('Repos error', status, data);
                $scope.loader.close();
                showAlert('Noget gik galt. Forsøg venligst igensenere');
            });
        }
    };

    $scope.menu = function () {
        $rootScope.$evalAsync(function () {
            window.location = $scope.AppUrl + "#/Menu";
        });
    };

    $scope.Toggle = function (Value) {
        $scope.toggleObject = Value;
        if (Value == 2)
            $scope.BackImg = true;
        if (Value == 1)
            $scope.BackImg = false;
        //if (Value == 2 || Value == 3)
        //    $scope.$root.$broadcast('Default-DisplayFooterImg');
        //else
        //    $scope.$root.$broadcast('Default-HideFooterImg');
    };

    $scope.ToggleBack = function (Value) {
        if (Value == 4)
            Value = 2;
        Value = Value - 1;
        if (Value != 0) {
            $scope.toggleObject = Value;
            $scope.Toggle(Value);
            $scope.searchText = "";
            if (Value == 1) {
                $scope.LeadData = {
                    AccountId: "",
                    AccountName: "",
                    AccountNumber: "",
                    PostalCode: "",
                    //AccountManagerId: "",
                    BusinessAreaId: "",
                    ContactName: "",
                    ContactPhone: "",
                    ContactEmail: "",
                    Subject: "",
                    Description: "",
                    Submitter: "",
                    Permission: false
                };
                $scope.selectedAccount = "";
                //$scope.accounts = null;
            }
        }
    }

    $scope.ContactinfoValidate = function () {
        //alert($scope.LeadData.ContactNo);
        //if ($scope.LeadData.ContactPhone != "" && $scope.LeadData.ContactName != "" && $scope.LeadData.ContactEmail != "")
        if ($scope.form.$valid)
            $scope.Toggle(3);
    }

    $scope.ContactinfoSubmit = function () {
        if ($scope.form1.$valid) {
            showSubmitAlert("Er du sikker på at du vil sende Lead?");
        }
    };

    $scope.checklistitem = function (value, acountno) {
        //  window.Location.search();
        $scope.Toggle(value);
        // alert(acountno);
        $scope.lstitem = acountno;
        //$scope.lstitem.PostalCode = acountno.Addresses[0].PostalCode;
        $scope.lstitem.Email = acountno.Personel[0].Email;
        var arrayLength = acountno.Personel.length;
        for (var i = 0; i < arrayLength; i++) {
            if (acountno.Personel[i].Type == "SALESMANAGER") {
                $scope.ManagerInitial = acountno.Personel[i].Initials;
                break;
            }
        }
        $scope.selectedAccount = acountno;
    }

    $scope.checkBoxedClick = function () {
        checkBoxAlert("Bekræft at kunden har givet samtykke til at vi sender permission mail");
    }

    $scope.updateSearchText = function () {
        if ($scope.searchText != "" && $scope.searchText != undefined) {
            var firstLetter = $scope.searchText.substr(0, 1).toUpperCase();
            var str = $scope.searchText.substr(1, $scope.searchText.length);
            $scope.searchText = firstLetter + str;
        }
    }

    $scope.updateNameText = function () {
        if ($scope.LeadData.ContactName != "" && $scope.LeadData.ContactName != undefined) {
            var firstLetter = $scope.LeadData.ContactName.substr(0, 1).toUpperCase();
            var str = $scope.LeadData.ContactName.substr(1, $scope.LeadData.ContactName.length);
            $scope.LeadData.ContactName = firstLetter + str;
        }
    }

    $scope.updateTitleText = function () {
        if ($scope.LeadData.Subject != "" && $scope.LeadData.Subject != undefined) {
            var firstLetter = $scope.LeadData.Subject.substr(0, 1).toUpperCase();
            var str = $scope.LeadData.Subject.substr(1, $scope.LeadData.Subject.length);
            $scope.LeadData.Subject = firstLetter + str;
        }
    }

    $scope.updateDescText = function () {
        if ($scope.LeadData.Description != "" && $scope.LeadData.Description != undefined) {
            var firstLetter = $scope.LeadData.Description.substr(0, 1).toUpperCase();
            var str = $scope.LeadData.Description.substr(1, $scope.LeadData.Description.length);
            $scope.LeadData.Description = firstLetter + str;
        }
    }

    $scope.SearchFunc = function (searchtxt) {
        if (searchtxt != undefined && searchtxt != "") {
            $scope.loader = getLoader();
            $scope.loader.open();
            var getUrl = AccountsUrl + searchtxt;
            $http({
                url: getUrl,
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                if (data.Count > 0) {
                    $scope.loader.close();
                    $scope.NoRec = false;
                }
                else {
                    $scope.loader.close();
                    $scope.NoRec = true;
                    showAlert("Ingen resultater - Prøv igen");
                }
            }).then(function (response) {
                localStorageService.set('accounts', response.data.Results);
                $scope.accounts = localStorageService.get('accounts');
            });
        }
        else showAlert("Ingen resultater - Prøv igen");
    }
}]);