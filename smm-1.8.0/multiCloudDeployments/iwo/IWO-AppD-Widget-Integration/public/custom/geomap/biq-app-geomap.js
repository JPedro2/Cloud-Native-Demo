
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
    constructor(store){
        this.store = store;
    }

    getHealth(){
        return _MODEL_GREEN;
    }

    clicked(mouseX,mouseY){
        var distance = dist(mouseX,mouseY,pos.x, pos.y);
        return distance < 15;
    }

    getImageIcon(){
        return DEFAULT_STORE_ICONS["GREEN"];
    }

    draw(geoMapComponent){
        //now convert long and lat into x,y
        this.pos = geoMapComponent.getPosition(this.store.storeInfo.latitude,this.store.storeInfo.longitude);
        image(this.getImageIcon(),this.pos.x,this.pos.y,iconSize,iconSize);  

        console.log(this.store.id+" "+this.pos.x,this.pos.y);

        var hasReadyOrders = this.store.hasReadyOrders;
        var hasReceivedOrders = this.store.hasReceivedOrders;
        var slaReadyFailed = this.store.slaReadyFailed;
        var slaReceivedFailed = this.store.slaReceivedFailed;

        fill(255,255,255,0); 
        ellipseMode(CENTER); 
        if(hasReceivedOrders){
            if(slaReceivedFailed){
                stroke('red');    
            }else{
                stroke('green'); 
            }
        }else{
            stroke('grey'); //grey for no orders
        }
        strokeWeight(7);
        ellipse(this.pos.x, this.pos.y, iconSize*1.5, iconSize*1.5);

        if(hasReadyOrders){
            if(slaReadyFailed){
                stroke('red');    
            }else{
                stroke('green'); 
            } 
        }else{
            stroke('grey'); //grey for no orders
        }
        strokeWeight(7);
        ellipse(this.pos.x, this.pos.y, iconSize*2, iconSize*2); 
    }

    clicked(mouseX,mouseY){
        var distance = dist(mouseX,mouseY,this.pos.x, this.pos.y);
        return distance < 15;
    }
}


class GeoMapComponent extends BaseChart {
    constructor(options) {
        options.div = options.targetId;
        super(options);
        this.mappa = new Mappa('Leaflet');
        this.canvas = createCanvas(windowWidth-250,windowHeight-50).parent(options.div); 
        this.geomap = null;
        this.dataModels = [];
        
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

    buildModels(data){
        this.dataModels.length = 0;
        var models = this.dataModels;
        data.forEach(function(rec){
            models.push(new StoreModel(rec));
        });
    }

    renderChart(data,clickFunction) {
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

        this.map = L.map(super.getOptions().div);
        L.tileLayer(options.style,{minZoom: 1, maxZoom: 18, attribution: options.attribution}).addTo(this.map);
        this.map.setView([options.lat, options.lng], options.zoom);
        this.storeFeatureGroup = L.featureGroup().addTo(this.map);
        
        this.storeFeatureGroup.on('click', function(ev) {
            var storeId = ev.layer.storeId;
            clickFunction(storeId);
        });

        super.updateChartOptions(options);
        this.drawModels(data);
        this.map.featureGroup = this.storeFeatureGroup;
    }

    renderChartOld(onClick){
        imageMode(CENTER);
        
        this.buildModels(this.getOptions().data);

        var options = {
            lat: 39.8283,
            lng: -98.5795,
            zoom: 5,
            zoomSnap :.5,
            zoomDelta : .1,
            minZoom: 2,
            maxZoom: 7,
            style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
            
        }

        super.updateChartOptions(options);
        this.geomap = this.mappa.tileMap(options); 
        this.geomap.overlay(this.canvas);
        var comp = this;
        this.geomap.onChange(function(e){
            comp.drawModels(); 
        });
        this.geomap.onMethod("zoomend",function(e){
            comp.drawModels();
        });
        this.geomap.onMethod("moveend",function(e){
                comp.drawModels(); 
        });
        
        this.drawModels();
    }

    getPosition(lat,long){
        return this.geomap.fromLatLngToPixel(L.latLng(lat, long));
    }


    drawModels(){
        clear();
        var comp = this;
        var models = this.dataModels;
        models.forEach(function(model){
           model.draw(comp);     
        });
    }

    getDataModelsClicked(mouseX,mouseY){
        var clickedModels = [];
        var models = this.dataModels;
        models.forEach(function(model){
           if(model.clicked(mouseX,mouseY)){
               clickedModels.push(model);
           }     
        });
        return clickedModels;
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