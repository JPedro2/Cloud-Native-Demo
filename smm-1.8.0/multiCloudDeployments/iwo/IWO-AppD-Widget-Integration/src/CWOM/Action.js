var Link = require('./Link.js');
var Target = require('./Target.js');
var Entity = require('./Entity.js');
var Risk = require('./Risk.js');
var Template = require('./Template.js');
var Stat = require('./Stat.js');
var Location = require('./Location.js');
var base64 = require('base-64');

module.exports = class Action {
    constructor(action) {
        if(!action) {
            action = {};
        }
        this.links = [];
        if(!action.links) { action.links = [];}
        for(var i = 0; i < action.links.length; i++) {
            var link = action.links[i]
            this.links.push(new Link(link));
        }
        this.uuid = action.uuid || '';
        this.createTime = action.createTime || '';
        this.actionType = action.actionType || '';
        this.actionMode = action.actionMode || '';
        this.actionState = action.actionState || '';
        this.details = action.details || '';
        this.importance = action.importance || 0;
        this.target = new Target(action.target);
        this.currentEntity = new Entity(action.currentEntity);
        this.newEntity = new Entity(action.newEntity);
        this.currentValue = parseFloat(action.currentValue) || 0;
        this.newValue = parseFloat(action.newValue) || 0;
        this.resizeToValue = action.resizeToValue || '';
        this.template = new Template(action.template);
        this.risk = new Risk(action.risk);
        this.stats = [];
        if(!action.stats){ action.stats = []; }
        for(var i = 0; i < action.stats.length; i++) {
            var stat = action.stats[i];
            this.stats.push(new Stat(stat));
        }
        this.currentLocation = new Location(action.currentLocation);
        this.newLocation = new Location(action.newLocation);

        this.actionid = action.actionid || 0;
        this.environmentType = action.environmentType || '';
        this.actionURL = base64.encode("/view/main/"+ this.currentEntity.uuid +"/actions");
        this.entityURL = base64.encode("/view/main/"+ this.currentEntity.uuid +"/overview");
    }

}