
const _MODEL_GREEN = "GREEN";
const _MODEL_YELLOW = "YELLOW";
const _MODEL_RED = "RED";

const DEFAULT_HEALTH_RANGE_PERCENTAGES = {
    "RED" : 80,
    "YELLOW" : 90,
    "GREEN" : 95
}

const iconSize =32;

var GREENSTORE_ICON,YELLOWSTORE_ICON,REDSTORE_ICON;

var DEFAULT_STORE_ICONS;

 class StoreModel {
    constructor(data){
        this.id = data[0];
        this.normal = data[1];
        this.healthRange = DEFAULT_HEALTH_RANGE_PERCENTAGES;
        this.storeIcons = DEFAULT_STORE_ICONS;
        this.geoInfo = {latitude:data[2],longitude:data[3]};

        var pos;
    }

    getHealth(){
        var normal = this.normal;
        var health;
        if(normal > this.healthRange[_MODEL_GREEN]){
            health = _MODEL_GREEN;
        }else if (normal > this.healthRange[_MODEL_RED] &&  normal < this.healthRange[_MODEL_GREEN]){
            health = _MODEL_YELLOW;
        }else if (normal < this.healthRange[_MODEL_RED]){
            health = _MODEL_RED;
        }
        return health;
    }

    getImageIcon(){
        var health = this.getHealth();
        return this.storeIcons[health];    
    }
    

    draw(geoMapComponent){
        //now convert long and lat into x,y
        var circleMarker = L.circle([this.geoInfo.latitude, this.geoInfo.longitude], {title:this.id,color:this.getHealth(),weight:5,radius:50000}).addTo(geoMapComponent.storeFeatureGroup);
        circleMarker.on('click', function(ev){
            var latlng = geoMapComponent.map.mouseEventToLatLng(ev.originalEvent);
            console.log(latlng.lat + ', ' + latlng.lng);
        });
        this.pos = circleMarker._point;
    }

    clicked(geoMapComponent, mouseX,mouseY){
            var point = L.point(mouseX,mouseY);
            var latlng = geoMapComponent.map.containerPointToLatLng(point);
           var distance = dist(latlng.lat, latlng.lng, this.geoInfo.latitude, this.geoInfo.longitude);
          return distance < 5;
    }
}


class GeoMapComponent extends BaseChart {
    constructor(options) {
        options.div = options.targetId;
        super(options);
        //this.mappa = new Mappa('Leaflet');

        this.canvas = createCanvas(windowWidth-25,windowHeight-175).parent(options.div); 
        this.map = null;
        this.dataModels = [];
        this.storeFeatureGroup = null;
        
        GREENSTORE_ICON = loadImage('/img/geomap/store-green.png');
        YELLOWSTORE_ICON = loadImage('/img/geomap/store-yellow.png');
        REDSTORE_ICON = loadImage('/img/geomap/store-red.png');
        
        DEFAULT_STORE_ICONS = {
            "RED" : REDSTORE_ICON,
            "YELLOW" : YELLOWSTORE_ICON,
            "GREEN" : GREENSTORE_ICON
        }
        
    }

    generateSampleData(){
        return [];
    }

    renderChart(onClick){
        
        var data = this.getOptions().data;
        // if(!data){
        //     data = this.generateSampleData();
        // }
        var models = this.dataModels;
        data.forEach(function(rec){
            models.push(new StoreModel(rec));
        });


        var options = {
            lat: 39.8283,
            lng: -98.5795,
            zoom: 5,
            style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        }

        super.updateChartOptions(options);
        this.map = L.map(super.getOptions().div, {preferCanvas:true});
        L.tileLayer(options.style,{minZoom: 1, maxZoom: 18, attribution: options.attribution}).addTo(this.map);
        this.map.setView([options.lat, options.lng], options.zoom);
        this.storeFeatureGroup = L.featureGroup().addTo(this.map);
        this.map.featureGroup = this.storeFeatureGroup;
        var comp = this;
        // this.map.onChange(function(){
        //     comp.drawModels();
        // });
        this.drawModels();
    }

    getPosition(lat,long){
        //return this.map.getPosition();
    }


    drawModels(){
        clear();
        this.storeFeatureGroup.clearLayers();
        var comp = this;
        var models = this.dataModels;
        models.forEach(function(model){
           model.draw(comp);     
        });
    }

    getDataModelsClicked(mouseX,mouseY){
        var clickedModels = [];
        var models = this.dataModels;
        var comp = this;
        models.forEach(function(model){
           if(model.clicked(comp,mouseX,mouseY)){
               clickedModels.push(model);
           }     
        });
        return clickedModels;
    }

    showComponent(comp,x,y){
        var parentCanvas = select("#defaultCanvas0").parent();
        var compElement = select("#"+comp.getOptions().targetId);
        compElement.parent(parentCanvas);
        compElement.position(x,y);
        compElement.style('z-index',10000);
        compElement.show();
    }
}