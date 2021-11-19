var restManager = require('./RestManager');
var dateHelper = require('./DateHelper.js');
var Q = require('q');

exports.simpleQuery = function(query,callback){

	var start = dateHelper.getStartTime();
	var end   = dateHelper.getEndTime(start);
	restManager.analyticsQuery(query,start,end,10,function(err,response){
		callback(err,response);
	});
}

exports.normalQuery = function(query,start,end,limit,callback){
	restManager.analyticsQuery(query,start,end,limit,function(err,response){
		callback(err,response);
	});
}

exports.query = function(query,start,end,limit){
	var deferred = Q.defer();
	restManager.analyticsQuery(query,start,end,limit,function(err,response){
		if(err){
			deferred.reject(new Error(err));
		}else{
			deferred.resolve(response);
		}
	});
	return deferred.promise;
}

exports.restUIADQL = function(query,start,end,limit){
	var deferred = Q.defer();
	restManager.restUIADQL(query,start,end,limit,function(err,response){
		if(err){
			deferred.reject(new Error(err));
		}else{
			deferred.resolve(response);
		}
	});
	return deferred.promise;
}
