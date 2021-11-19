
var adqlEnd = new Date();
var adqlStart   = new Date();
adqlStart.setDate(adqlStart.getDate()-1);
var adqlApiResultsLimit = 1000;
var debugApp = false;

function startDate(date){
    var tempDate;
    if(date){
        tempDate = new Date(date);
    }else{
        tempDate = new Date();
    }
    tempDate.setSeconds(0);
    tempDate.setMilliseconds(0);
    return tempDate;
}

function endDate(date){
    var tempDate = startDate(date);
    tempDate.setSeconds(59);
    tempDate.setMilliseconds(999);
    return tempDate;
}


function getSelectedTimeDescription(){
    return $("#timeRange option:selected").text();
}

function jsonDates(start,end){
    return {start:start.getTime(),end:end.getTime()};
}

function getTimeBucketFromDate(date){
    var start = startDate(date);
    var end = endDate(date);
    start.setMinutes(start.getMinutes() - getTimeBucketAsMinutes());
    return jsonDates(start,end);
}

//User selects time range selection
//Return start minute and end minute based on date range selected
function getTimeRange(){
    var end = endDate();
    var start = applyTimeBasedOnSelection(startDate());
    return jsonDates(start,end);
}

function getTimeRangeStartingFromDate(date){
    var end = endDate(date);
    var start = applyTimeBasedOnSelection(startDate(date));
    return jsonDates(start,end);
}

function getTimeRangeBasedOnSelection(selection){
    var end = endDate();
    var start = applyTimeForSelection(startDate(),selection);
    return jsonDates(start,end);
}


function applyTimeBasedOnSelection(start){
    var selection = $("#timeRange").val();
    updateDateBasedOnSelection(start,selection)
    return start;
}

function applyTimeForSelection(start,selection){
    updateDateBasedOnSelection(start,selection)
    return start;
}


function updateDateBasedOnSelection(start,selection){
    switch(selection){
		case '1' : 
            start.setMinutes(start.getMinutes() - 1);
            break;
		case '5' : 
            start.setMinutes(start.getMinutes() - 5);
            break;
        case '15' : 
            start.setMinutes(start.getMinutes() - 15);
            break;
        case '30' : 
            start.setMinutes(start.getMinutes() - 30);
            break;
        case '1h' : 
            start.setHours(start.getHours() - 1);
            break;
        case '2h' : 
            start.setHours(start.getHours() - 2);
            break;
        case '3h' : 
            start.setHours(start.getHours() - 3);
            break;
        case '4h' : 
            start.setHours(start.getHours() - 4);
            break;
        case '6h' : 
            start.setHours(start.getHours() - 6);
            break;
        case '12h' : 
            start.setHours(start.getHours() - 12);
            break;
        case '1d' : 
            start.setDate(start.getDate() - 1);
            break;
        case '2d' : 
            start.setDate(start.getDate() - 2);
            break;
        case '3d' : 
            start.setDate(start.getDate() - 3);
            break;
        case '1w' : 
            start.setDate(start.getDate() - 7);
            break;
        case '2w' : 
            start.setDate(start.getDate() - 14);
            break;
        case '3w' : 
            start.setDate(start.getDate() - 21);
            break;
        case '1m' : 
            start.setMonth(start.getMonth() - 1);
            break;
        case '2m' : 
            start.setMonth(start.getMonth() - 2);
            break;
        case '3m' : 
            start.setMonth(start.getMonth() - 3);
            break;
    }
    return start;
}



function getTimeBucket(){
    var selection = $("#timeRange").val();
    switch(selection){
		case '1' : 
            return '1m';
            break;
		case '5' : 
            return '1m';
            break;
        case '15' : 
            return '1m';
            break;
        case '30' : 
            return '1m';
            break;
        case '1h' : 
            return '5m';
            break;
        case '2h' : 
            return '5m';
            break;
        case '3h' : 
            return '10m';
            break;
        case '4h' : 
            return '10m';
            break;
        case '6h' : 
            return '10m';
            break;
        case '12h' : 
            return '10m';
            break;
        case '1d' : 
            return '10m';
            break;
        case '2d' : 
            return '20m';
            break;
        case '3d' : 
            return '30m';
            break;
        case '1w' : 
            return '1h';
            break;
        case '2w' : 
            return '2h';
            break;
        case '3w' : 
            return '2h';
            break;
        case '1m' : 
            return '4h';
            break;
        case '2m' : 
            return '12h';
            break;
        case '3m' : 
            return '24h';
            break;
    }    
}

function getTimeBucketAsMinutes(){
    var timeBucket = getTimeBucket();
    switch(timeBucket){
        case '1m' : 
            return 1;
            break;
        case '5m' : 
            return 5;
            break;
        case '10m' : 
            return 10;
            break;
        case '20m' : 
            return 20;
            break;
        case '30m' : 
            return 30;
            break;
        case '1h' : 
            return 60;
            break;
        case '2h' : 
            return 120;
            break;
        case '4h' : 
            return 240;
            break;
        case '8h' : 
            return 480;
            break;
        case '12h' : 
            return 720;
            break;
        case '24h' : 
            return 1440;
            break;

    }
}

var animCount = 0;
var spinner;

var biqSpinnerOpts = {
length: 5 // The length of each line
, radius : 5
, width : 2
, color: '#ffffff' // #rgb or #rrggbb or array of colors
, top: '15px' // Top position relative to parent
, left: '20%' // Left position relative to parent
}

function startAnim(query){
    animCount++;
    if(animCount > 0){
        var target = document.getElementById('spinnerDiv');
        if(!target){
            return;
        }
        if(!spinner){
            spinner = new Spinner(biqSpinnerOpts).spin(target);        
        }else{
            spinner.spin(target);
        }
    }
}

function stopAnim(query){
    animCount--;
    var target = document.getElementById('spinnerDiv');
    if(animCount < 1 && target){
       $("#spinnerDiv").html("");
    }
}

var analyticsUrl = '/analytics';
var analyticsRestUIUrl = '/analytics/restui';

function searchWithOptions(options,callback){
    var url = analyticsUrl;
    var timeRange = getTimeRange();
    if(options.url){
        url = options.url;
    }
    if(options.date){
        timeRange = getTimeBucketFromDate(options.date);
    }else if(options.timeRange){
        timeRange = options.timeRange;
    }else if(options.start && options.end){
        timeRange = {start:start,end:end};
    }else if(options.startDate && options.endDate){
        timeRange = jsonDates(options.startDate,options.endDate);
    }

    postQuery(url,options.query,timeRange.start,timeRange.end,callback);
}

function search(options,callback){
    searchWithOptions(options,callback)
}

function searchRestUI(options,callback){
    options.url = analyticsRestUIUrl;
    searchWithOptions(options,callback);
}

function appLog(message){
    if(debugApp){
        console.log(message);
        if(message.start || message.end){
            console.log("start: "+formatDateLong(new Date(message.start))+" end: "+formatDateLong(new Date(message.end)));
        }
    }
}

function replaceNulls(query){
    if(query.includes("='null'")){
        query = query.split("='null'").join(" IS NULL ");
    }
    if (query.includes("= 'null'")){
        query = query.split("= 'null'").join(" IS NULL ");
    }
    return query;
}

function postQuery (analyticsUrl,query,start,end,callback){
    if(query.toLowerCase().includes("as count")){
        query += " Limit "+ adqlApiResultsLimit;
    }
    query = replaceNulls(query);
    
    var request = {query:query,start:start,end:end, limit: adqlApiResultsLimit};
    
    startAnim(query);
    $.ajax({
            url: analyticsUrl,
            method: "POST",
            data : request
    }).done(function (data) {
        appLog(request);
        if(data[0].error){
            alert("An Error Occurred \n :"+data[0].error);
        }else{
            appLog(data[0].results);
            callback(data[0].results);
        }
        stopAnim(query);
    }).fail(function (jqXHR, message) { 
        alert(jqXHR.statusText+" : "+jqXHR.responseText);
        stopAnim(query);
    });
}

function makePostCall (url,parms,callback){
    startAnim(url);
    $.ajax({
            url: url,
            method: "POST",
            data : parms
    }).done(function (data) {
        appLog(data);
        if(data[0].error){
            alert("An Error Occurred \n :"+data[0].error);
        }else{
            appLog(data[0].results);
            callback(data[0].results);
        }
        stopAnim(url);
    }).fail(function (jqXHR, message) { 
        alert(jqXHR.statusText+" : "+jqXHR.responseText);
        stopAnim(url);
    });
}

function makeGetCall (url,callback){
    startAnim(url);
      $.ajax({
              url: url,
              method: "GET"
      }).done(function (data) {
          stopAnim(url);
          callback(data);
      }).fail(function (jqXHR, message) { 
          alert(jqXHR.statusText+" : "+jqXHR.responseText);
      });
}

var COLOR_NORMAL = "#79DD1B";
var COLOR_SLOW = "#FFD24D";
var COLOR_VERY_SLOW = "#FF9326";
var COLOR_STALL = "#938BE6";
var COLOR_ERROR = "#EF5C5D";

function getHealthColor(health){
    switch(health){
        case 'NORMAL' : 
            return COLOR_NORMAL;
            break;
        case 'SLOW' : 
            return COLOR_SLOW;
            break;
        case 'VERY_SLOW' : 
            return COLOR_VERY_SLOW;
            break;
        case 'STALL' : 
            return COLOR_STALL;
            break;
        case 'ERROR' : 
            return COLOR_ERROR;
            break;
    }
}

function lookup(query,callback){
    var timeRange = getTimeRange();
    postQuery(analyticsUrl,query,timeRange.start,timeRange.end,function(results){
        filteredList = [];
        if(results){
            results.forEach(function(rec){
                if(rec[0]){
                    filteredList.push(rec[0]);
                }
            })
        }
        if(filteredList.length == 0){
            filteredList.push("No Results Found ...");
        }
        callback(filteredList);
    });
}

function lookupArray(query,callback){
    var timeRange = getTimeRange();
    postQuery(analyticsUrl,query,timeRange.start,timeRange.end,function(results){
        filteredList = [];
        results.forEach(function(rec){
            rec[0].forEach(function(field){
                if($.inArray(field, filteredList)<0){
                    filteredList.push(field);
                }
            })
        })
        callback(filteredList);
    });
}

function autoCompleteArray(selector,source,adqlField,callback){
    $( selector ).autocomplete({
        source: function( request, response ) {
            var value = $(selector).val();
            var query = "SELECT "+adqlField+" FROM "+source+" WHERE "+adqlField+" is NOT NULL and "+adqlField+" = '"+value+"*'";
            lookupArray(query,response);
        },
        minLength: 1,
        select: function( event, ui ) {
            if(callback){
                callback(ui.item);
            }
        }
    } );
}

function autoComplete(selector,source,adqlField,callback){
    $( selector ).autocomplete({
        sortResults:true,
        source: function( request, response ) {
            var value = $(selector).val();
            var query = "SELECT distinct ("+adqlField+") FROM "+source+" WHERE "+adqlField+" is NOT NULL and "+adqlField+" = '"+value+"*'";
            lookup(query,response);
        },
        minLength: 1,
        select: function( event, ui ) {
            if(callback){
                callback(ui.item);
            }
        }
    } );
}

function autoComplete(selector,query,callback){
    $( selector ).autocomplete({
        sortResults:true,
        source: function( request, response ) {
            var value = $(selector).val();
            lookup(query,response);
        },
        minLength: 1,
        select: function( event, ui ) {
            if(callback){
                callback(ui.item);
            }
        }
    }).focus(function() {
        $(this).autocomplete("search", "*");
    });
}

function buildQueryForAutoCompleteOnFilter(query,adqlField,value){
    var tempQuery = query;
    var hasWhere = query.toLowerCase().indexOf("where") > 0;
    var hasOrderBy = query.toLowerCase().indexOf("order by") > 0;
    var orderBy = "";
    if(hasOrderBy){
        var pos = query.toLowerCase().indexOf("order by");
        tempQuery = query.substring(0,pos);
        orderBy = query.substring(pos,query.length);
    }
    if(value && value.length > 1){
        if(hasWhere){
            tempQuery = tempQuery+ " and "+adqlField+" = '*"+value+"*'";
        }else{
            tempQuery = tempQuery+ " WHERE "+adqlField+" = '*"+value+"*'";
        }
    }
    if(!hasOrderBy){
        tempQuery = tempQuery + " order by "+adqlField+" asc";
    }else{
        tempQuery = tempQuery+" "+orderBy;
    }
    return tempQuery;
}

function autoCompleteOnFilter(selector,query,adqlField,callback){
    $( selector ).autocomplete({
        sortResults:true,
        source: function( request, response ) {
            var value = $(selector).val();
            var tempQuery = buildQueryForAutoCompleteOnFilter(query,adqlField,value);
            lookup(tempQuery,response);
        },
        minLength: 1,
        select: function( event, ui ) {
            if(callback){
                callback(ui.item);
            }
        }
    }).focus(function() {
        $(this).autocomplete("search", "*");
    });
}


function getTimeRangeText(){
    return $( "#timeRange option:selected" ).text();
}

function stringClause(clauses,fieldname, value){
    if(hasValue(value)){
        clauses.push(fieldname+" = '"+value+"'");
    }
}

function numberClause(clauses,fieldname, value){
    if(value == "null"){
        clauses.push(fieldname+" IS NULL ");
    } else if(hasValue(value)){
        clauses.push(fieldname+" = "+value);
    }
}



function includeClauses(query, clauses,condition){
    if(clauses.length > 0){
        if(!query.toUpperCase().includes("WHERE")){
            query = query +" WHERE "
        }
        for (i = 0; i < clauses.length; i++) { 
            query = query + clauses[i];
            if( (i+1) < clauses.length){
                query = query + condition;
            }
        }
    }
    return query;
}
  
var getDateTimeRangeDescription = function(range){
    var startTime = new Date(range.start);
    var endTime = new Date(range.end);
    return formatDateLong(startTime)+" - "+formatDateLong(endTime);
}

var formatDate = function(d){
    var datestring = ("0"+(d.getMonth()+1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    return datestring;
}

var formatDateLong = function(d){
    var datestring = ("0"+(d.getMonth()+1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)+ ":" + ("0" + d.getSeconds()).slice(-2);
    return datestring;
}


var shortTime = function(d){
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
}

var escapeQuery = function(query){
    query = query.replace(/ /g,"%2520");
    query = query.replace(/=/g,"%253D");
    return query;
}


var hasValue = function(value){
    return value && value.length > 0;
}

var roundValue = function(value){
    return Math.round(value * 10) / 10;
}

var copyTextToClipBoard = function(text){
	var oText = false,
	bResult = false;
	try
	{
		oText = document.createElement("textarea");
		$(oText).addClass('clipboardCopier').val(text).insertAfter('body').focus();
		oText.select();
		document.execCommand("Copy");
		bResult = true;
	} catch(e) {}

	$(oText).remove();
	return bResult;
}

try{
    if(exports){
        exports.buildQueryForAutoCompleteOnFilter  = buildQueryForAutoCompleteOnFilter;
    }
  }catch(error){
   // console.log(error);
  }

