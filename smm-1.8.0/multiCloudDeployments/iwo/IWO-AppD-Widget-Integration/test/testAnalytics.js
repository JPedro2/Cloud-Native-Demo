var log4js 			= require('log4js');
var log 			= log4js.getLogger("testScoreManager");
var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var mgr	= require("../src/AnalyticsManager.js");

describe("Functional test of querying analytics", function() {
	it('Test Query', function (done) {
        mgr.simpleQuery("SELECT segments.userData.CompanyId, userExperience, responseTime FROM transactions WHERE userExperience = 'STALL'",function(err,response){
            console.log(JSON.stringify(response));
            done();
        })
    });
    
    it('Normal Query', function (done) {
        mgr.normalQuery("SELECT segments.userData.CompanyId, userExperience, responseTime FROM transactions WHERE userExperience = 'STALL'",1503517097644,1503430697644,100,function(err,response){
            console.log(JSON.stringify(response));
            done();
        })
    });
    
    it('Normal Query 2', function (done) {
        mgr.normalQuery("SELECT segments.userData.CompanyId, userExperience, responseTime FROM transactions WHERE userExperience = 'STALL'",1503464400000,1503550799999,100,function(err,response){
            console.log(JSON.stringify(response));
            done();
        })
	});
});