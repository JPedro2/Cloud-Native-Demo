var assert = require("chai").assert;
var appCharts = require("../public/analytics/js/biq-app-charts.js");

describe("Test Filters", function() {
	it('Test No Filters', function (done) {
        var query = "select name from transactions";
        var filters = [];
        var result = appCharts.biqUpdateQuery({},query,filters);
        assert.equal(query,result);
        done();
    });

    it('Test Filters With No Where Clause', function (done) {
        var query = "select name from transactions";
        var filters = [{field:'pagename',value:'test'}];
        var result = appCharts.biqUpdateQuery({},query,filters);
        assert.equal("select name from transactions WHERE pagename = 'test'",result);
        done();
    });

    it('Test Filters With No Where Clause and multiple filters', function (done) {
        var query = "select name from transactions";
        var filters = [{field:'pagename',value:'test'},{field:'pagename2',value:'test2'}];
        var result = appCharts.biqUpdateQuery({},query,filters);
        assert.equal("select name from transactions WHERE pagename = 'test' AND pagename2 = 'test2'",result);
        done();
    });

    it('Test Filters With Where Clause ', function (done) {
        var query = "select name from transactions where appkey='1'";
        var filters = [{field:'pagename',value:'test'}];
        var result = appCharts.biqUpdateQuery({},query,filters);
        assert.equal("select name from transactions where appkey='1' AND pagename = 'test'",result);
        done();
    });

    it('Test Filters With Where Clause AND multiple filters', function (done) {
        var query = "select name from transactions where appkey='1'";
        var filters = [{field:'pagename',value:'test'},{field:'pagename2',value:'test2'}];
        var result = appCharts.biqUpdateQuery({},query,filters);
        assert.equal("select name from transactions where appkey='1' AND pagename = 'test' AND pagename2 = 'test2'",result);
        done();
    });



});