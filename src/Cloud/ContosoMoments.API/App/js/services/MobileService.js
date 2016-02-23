﻿'use strict';

contosoMomentsApp
    .factory('mobileServicesClient', ['appConfig', function (appConfig) {

        var serviceClient = new WindowsAzure.MobileServiceClient(appConfig.DefaultServiceURL || '/', appConfig.MobileClientAppKey || '');
        return serviceClient;

    }]);