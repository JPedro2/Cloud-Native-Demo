var moment = require('moment');
var configManager = require("./ConfigManager.js");

exports.getTodayAsNumber = function(){
	return moment().format('YYYYMMDD'); 
}

exports.getDateAsNumber = function(date){
	var moDate = this.getMomentForDate(date);
	return moDate.format('YYYYMMDD');
}

exports.getPreviousDay = function(date){
	var moDate = this.getMomentForDate(date);
	return moDate.add(-1, 'days');
}

exports.getPreviousDateAsNumber = function(chosenDate){
	var date = this.getMomentForDate(chosenDate);
	var prevDate = this.getPreviousDay(date);
	return parseInt(this.getDateAsNumber(prevDate));
}

exports.getTodayAsMilliseconds = function(){
	return moment().valueOf();
}

exports.getMomentForDate = function(date){
	if(date)
		return moment(date);
	else
		return moment();
}

exports.getStartTime = function(dayMoment){
	var startDate = this.getMomentForDate(dayMoment);
	startDate.hour(0);
	startDate.minute(0);
	startDate.second(0);
	startDate.milliseconds(0);
	return startDate.valueOf();
}

exports.getEndTime = function(dayMoment){
	var endDate = this.getMomentForDate(dayMoment);
	endDate.hour(23);
	endDate.minute(59);
	endDate.second(59);
	endDate.milliseconds(999);
	return endDate.valueOf();
}

exports.getTimeRange = function(){
	return this.getFormatTimeRange(moment());
}

exports.getPreviousDayTimeRange = function(){
	return this.getFormatTimeRange(this.getPreviousDay());
}

exports.getFormatTimeRange = function(dayMoment) {
	return "time-range-type=BETWEEN_TIMES&start-time="+this.getStartTime(dayMoment)+"&end-time="+this.getEndTime(dayMoment);	
}

exports.getDateRangeAsNumber = function(dayAsNumber,range){
	var startDate = this.getMomentForDate(dayAsNumber.toString());
	var range = startDate.add(-(range),'days');
	return parseInt(this.getDateAsNumber(range));
}

exports.getStartTimeAndEndTime = function(minuteDifference){
	var now = moment();
	var end = moment();
	end.add(-(minuteDifference),'minutes');
	return {"start":now.valueOf(),"end":end.valueOf()};
}

exports.getDatesAsMillisecondsBasedOnRange = function(lastDays){
	var startDate = moment();
	var momentDate = this.getMomentForDate(startDate);
	momentDate.add(-(lastDays),'days');
	var startInt = startDate.valueOf();
	var endInt = momentDate.valueOf();
	return {startdate:endInt,enddate:startInt};
}

exports.getHourOfNow = function(){
	return moment().hour();    
}

exports.getMillisecondsAsDate = function(time){
	return moment(time, "x").format("MMM DD YYYY hh:mm a");
}