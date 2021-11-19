var getGroupsFromDataSet = function(groupData){
    var versions = [];
    var lookupString = "";
    for (var i=0; i< groupData.length;i++){
        var version = groupData[i][1];
        if(!version){
            version = "null";
        }
        if(lookupString.indexOf(version) < 0){
            lookupString += version;
            versions.push(version);
        }
    }
    return versions;
}

var getGroupDataRecForDate = function(date,versionArray){
    var data = versionArray[0].data;
    var found = null;
    if(data){
        for(var i=0; i< data.length; i++){
            var rec = data[i];
            if(date == rec.date){
                found = rec;
                break;
            }
        }
    }
    return found;
}

var getGroupArrayJSON = function(version,data){
    var found = null;
    for(var i=0; i< data.length; i++){
        var rec = data[i];
        if(version == rec[0].version){
            found = rec;
            break;
        }
    }    
    return found;
}

var getGroupArray = function(version,data){
    var found = null;
    for(var i=0; i< data.length; i++){
        var rec = data[i];
        if(version == rec[0]){
            found = rec;
            break;
        }
    }    
    return found;
}

var roundVal = function(value){
    return Math.round(value * 10) / 10;
}

var convertToGroupData = function(groupData,roundFlag){

    var versions = getGroupsFromDataSet(groupData);
    var columnArrays = [];
    var dates = ['dates'];
    columnArrays.push(dates);

    var chartData = [];
    chartData.push(dates);

    //the groupData gives us the date, group and count. Only non zero values are used.
    var prevDate = 0;
    groupData.forEach(function (rec) {
        var date = parseInt(rec[0]);
        if(date != prevDate){
            dates.push(date);
            prevDate = date;
        }

        var version = rec[1];
        if(!version){
            version = "null";
        }
        var count = rec[2];
        if(!count){
            count =0;
        }
        if(roundFlag){
            count = roundVal(rec[2]);
        }

        var versionArray = getGroupArrayJSON(version,columnArrays);
        if(!versionArray){
            versionArray = [{version:version,data:[{date:date,count:count}]}];
            columnArrays.push(versionArray);
        }
        versionArray[0].data.push({date:date,count:count});
    })

    //now fill in the gaps in the data set. Include the date, group and count where the count is zero
    for(var i=1; i< dates.length; i++){
        var dateRec = dates[i];
        //now make sure each group has a date and count
        var total = 0;
        versions.forEach(function(version){
            var versionArray = getGroupArrayJSON(version,columnArrays);
            var chartVersionData = getGroupArray(version,chartData);
            if(!chartVersionData){
                chartVersionData = [];
                chartVersionData.push(version);
                chartData.push(chartVersionData);
            }
            var versionDateRec = getGroupDataRecForDate(dateRec,versionArray);
            var count = 0;
            if(versionDateRec){
                count = versionDateRec.count;
            }
            chartVersionData.push(count);
            total += count;
        })
    }

    return chartData;
}

var mergeDataSets = function(dataSets){

    var keys = Object.keys(dataSets);
    
    var dates = ["dates"];
    var datesLookup = {};
    var results = [];
    results.push(dates);
    var dataLookup = {};
    
    //make first pass with dates
    keys.forEach(function(key){
        var data = dataSets[key];
        for(var i=0; i < data.length; i++){
            var rec = data[i];
            if(!datesLookup[rec[0]]){
                datesLookup[rec[0]] = parseInt(rec[0]);
                dates.push(parseInt(rec[0]));
            }
            dataLookup[key+"_"+rec[0]] = rec[1];
        }        
    })

    var datekeys = Object.keys(datesLookup);
    var keyResults = {};
    //now back fill missing data
    for(var i=0; i < datekeys.length; i++){
        var date = datekeys[i];
        //dates.push(parseIntdate);
        keys.forEach(function(key){
            var value = 0;
            if(dataLookup[key+"_"+date]){
                value = dataLookup[key+"_"+date];
            }
            if(!keyResults[key]){
                var results = [key];
                keyResults[key]=results;   
            }
            keyResults[key].push(value);
        });
    }

    var resultKeys = Object.keys(keyResults);
    resultKeys.forEach(function(key){
        results.push(keyResults[key]);
    });

    return results;
}   

try{
    if(exports){
        exports.getGroupsFromDataSet  = getGroupsFromDataSet;
        exports.getGroupDataRecForDate = getGroupDataRecForDate;
        exports.getGroupArrayJSON = getGroupArrayJSON;
        exports.getGroupArray = getGroupArray;
        exports.convertToGroupData = convertToGroupData;
        exports.roundVal = roundVal;
        exports.mergeDataSets = mergeDataSets;
    }
}catch(error){
   // console.log(error);
}