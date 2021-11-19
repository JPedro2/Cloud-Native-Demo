var assert = require("chai").assert;
var biqApp = require("../public/analytics/js/biq-app.js");

describe("Test AutoComplete", function() {
	it('Test buildQueryForAutoCompleteOnFilter No Value', function (done) {
        var query = "select distinct pagename from transactions";
        var adqlField = "pagename";
        var value = null;
        var result = biqApp.buildQueryForAutoCompleteOnFilter(query,adqlField,value);
        assert.equal("select distinct pagename from transactions order by pagename asc",result);
        done();
    });

    it('Test buildQueryForAutoCompleteOnFilter With Value', function (done) {
        var query = "select distinct pagename from transactions";
        var adqlField = "pagename";
        var value = "test";
        var result = biqApp.buildQueryForAutoCompleteOnFilter(query,adqlField,value);
        assert.equal("select distinct pagename from transactions WHERE pagename = '*test*' order by pagename asc",result);
        done();
    });

    it('Test buildQueryForAutoCompleteOnFilter With Order By', function (done) {
        var query = "select distinct pagename from transactions order by pagename desc";
        var adqlField = "pagename";
        var value = "test";
        var result = biqApp.buildQueryForAutoCompleteOnFilter(query,adqlField,value);
        assert.equal("select distinct pagename from transactions  WHERE pagename = '*test*' order by pagename desc",result);
        done();
    });

});