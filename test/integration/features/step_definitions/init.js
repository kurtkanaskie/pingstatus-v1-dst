/* jshint node:true */
'use strict';

var factory = require('./factory.js');
var config = require('../../test-config.json');

var apiproxy = config.pingstatus.apiproxy;
var basepath = config.pingstatus.basepath;
var clientId = config.pingstatus.clientId;
var clientSecret = config.pingstatus.clientSecret;

module.exports = function() {
    // cleanup before every scenario
    this.Before(function(scenario, callback) {
        this.apickli = factory.getNewApickliInstance();
        // this.apickli.storeValueInScenarioScope("clientId", "Uvz7ahhlaer3zhOp25BGmAzSQVEbsJNw");
        // this.apickli.storeValueInScenarioScope("clientSecret", "LOoE2q6enoqlTuBT");
        this.apickli.storeValueInScenarioScope("apiproxy", apiproxy);
        this.apickli.storeValueInScenarioScope("basepath", basepath);
        this.apickli.storeValueInScenarioScope("clientId", clientId);
        this.apickli.storeValueInScenarioScope("clientSecret", clientSecret);
        callback();
    });
};

