class LocationModel {
    constructor(location){
        this.location = location;
    }

    getId(){
        return this.location.station;
    }
   
    getLatitude(){
        return this.location.lat;
    }

    getLongitude(){
        return this.location.lon;
    }
    
    draw(comp){
        //now convert long and lat into x,y
        var lat = this.getLatitude();
        var lon = this.getLongitude();
        var marker = L.marker([lat,lon]).addTo(comp.featureGroup);
        marker.id = this.location.station;
        return marker;
    }

    
}


class FlightDelayGeoMap extends BaseChart {
    constructor(options) {
        super(options);
        this.geomap = null;
        this.dataModels = {};
        this.markers = {}
    }

    getInitOptions(){
        var compOptions = super.getOptions();
        var lat  = compOptions.lat ? compOptions.lat : 39.8283;
        var lng =  compOptions.lng ? compOptions.lng : -98.5795;
        var zoom = compOptions.zoom ? compOptions.zoom : 4;

        var style = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

        var options = {
            lat: lat,
            lng: lng,
            zoom: zoom,
            style: style,
            attribution:osmAttrib            
        }

        return options;
    }

    initView(){
        var options = this.getInitOptions();
        this.map.setView([options.lat, options.lng], options.zoom);
    }

    drawModels(data){
        this.initView();
        this.featureGroup.clearLayers();
        var geoMap = this;
        var dataModels = this.dataModels;
        var markers = this.markers;
        data.forEach(function(rec){
           var location = new LocationModel(rec);
           var id = location.getId();
           dataModels[id] = location;
           var marker = location.draw(geoMap);
           markers[id] = marker;
        });
    }

    renderChart(data,clickFunction) {
        var initOptions = this.getInitOptions();
		appLog("rending map : targetId = "+super.getOptions().targetId);
        this.map = L.map(super.getOptions().targetId);
        L.tileLayer(initOptions.style,{minZoom: 1, maxZoom: 18, attribution: initOptions.attribution}).addTo(this.map);
        this.initView();
        this.featureGroup = L.featureGroup().addTo(this.map);
        
        this.featureGroup.on('click', function(ev) {
            var id = ev.layer.id;
            clickFunction(id);
        });

        super.updateChartOptions(initOptions);
        this.drawModels(data);
        this.map.featureGroup = this.featureGroup;
    }

    getModel(id){
        return this.dataModels[id];
    }   

    popup(id){
        var marker = this.markers[id];
        marker.bindPopup("<b>"+marker.id+"</b>").openPopup();
    }

    focusLocation(id){
        var location = this.getModel(id);
        if(!location){
           return;
        }
        var currentZoom = this.map.getZoom();
        var zoom = 12;
        if(currentZoom > 12){
            zoom = currentZoom;
        }
        this.map.setView([location.getLatitude(), location.getLongitude()],zoom);
        this.popup(id);
    }


    showComponent(comp,x,y){
        var parentCanvas = select("#defaultCanvas0").parent();
        var compElement = select(comp);
        compElement.parent(parentCanvas);
        compElement.position(x,y);
        compElement.style('z-index',10);
        compElement.show();
    }
}

class FlightTimeLineChart extends BaseChart {
    constructor(options) {
      options.div = options.targetId;
      super(options);
      this.timeLineChart = null;
    }

    calcTimes(start,response){
        var startDate = new Date(start);
        var millis = startDate.getTime();
        var endTime = millis+response;
        var result = [startDate,new Date(endTime)]
        return result;
    }

    parseData(data){
        var groups = {};
        var subgroups = {};
        var results=[];

        data.forEach(transaction => {
            var app = transaction[0];
            var bt = transaction[1];
            var timestamp = transaction[2];
            var response = parseInt(transaction[3]);
            var experience = transaction[4];
            var id = transaction[5];
            var group = groups[app];
            if(!group){
                group = {group:app};
                groups[app] = group;
                group.data = [];
                results.push(group);
            }
            var subgroupKey = app+"__"+bt;
            var subgroup = subgroups[subgroupKey];
            if(!subgroup){
                subgroup = {label : bt};
                subgroup.data = [];
                subgroups[subgroupKey] = subgroup;
                group.data.push(subgroup);
            }
            subgroup.data.push({timeRange:this.calcTimes(timestamp,response),val:experience});
        });
        console.log(results);
        return results;
    }
    
    updateChart(data){
        data = this.parseData(data);
        this.timeLineChart.data(data);
    }

    renderChart(onClick) {
      var id = super.getDivId();
      var data = this.parseData(this.getOptions().data);
      var chartOptions = super.getChartOptions();
        
      if(!this.timeLineChart){
          this.timeLineChart = TimelinesChart()(document.getElementById(id));
          this.timeLineChart
          .maxHeight(chartOptions.height)
          .width(chartOptions.width)
          .zScaleLabel(chartOptions.scaleLabel)
          .zQualitative(true)
          .maxLineHeight(50)
          .dateMarker(new Date() - 365 * 24 * 60 * 60 * 1000) // Add a marker 1y ago
          .data(data);
      }else{
        this.timeLineChart.data(data);
      }
    }
  }