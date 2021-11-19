var log4js 			= require('log4js');
var log 			= log4js.getLogger("testDateHelper");
var assert    		= require("chai").assert;
var dateHelper  	= require("../src/DateHelper.js");
var moment = require('moment');


describe("Test Date Helper - Format Time Range", function() {
	it('Start Time Range', function (done) {
		var myDate = dateHelper.getMomentForDate("20160914");
		var startDate = dateHelper.getStartTime(myDate);
		assert.equal(1473829200000,startDate);
		
		done();
    });
	
	it('End Time Range', function (done) {
		var myDate = dateHelper.getMomentForDate("20160914");
		var endTime = dateHelper.getEndTime(myDate);
		assert.equal(1473915599999,endTime);
		done();
    });
	

	it('Format Time Range', function (done) {
		var myDate = dateHelper.getMomentForDate("20160914");
		var url = dateHelper.getFormatTimeRange(myDate);
		assert.equal(url,"time-range-type=BETWEEN_TIMES&start-time=1473829200000&end-time=1473915599999");
		done();
    });
	

	it('Test Previous Date as Number', function (done) {
		var date = dateHelper.getPreviousDateAsNumber("20160914");
		assert.equal(20160913,date);
		done();
    });
	
	it('Previous Date - with parameter', function (done) {
		var date = dateHelper.getPreviousDay("20160929");
		assert.equal(20160928,dateHelper.getDateAsNumber(date));
		done();
    });
	
	it('Previous Date - with no parameter', function (done) {
		var date = dateHelper.getPreviousDay();
		
		var currentDate = dateHelper.getPreviousDay(moment());
		dateHelper.getDateAsNumber(currentDate);
		
		assert.equal(dateHelper.getDateAsNumber(currentDate),dateHelper.getDateAsNumber(date));
		done();
    });
	
	it('Test Last 30 Days', function (done) {
		var dateAsNumber = dateHelper.getDateRangeAsNumber("20160914",30);
		assert.equal(20160815,dateAsNumber);
		done();
    });
		
	it('Test Milliseconds', function (done) {
		assert.equal(1475384399999,dateHelper.getEndTime("20161001"));
		done();
		});
	
	it('Test Range', function (done) {
		assert.equal(20170813,dateHelper.getDateRangeAsNumber(20170815,2));
		done();
    });
	
});

