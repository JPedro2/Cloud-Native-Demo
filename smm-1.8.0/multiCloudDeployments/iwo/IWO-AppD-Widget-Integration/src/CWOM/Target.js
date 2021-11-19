var Aspects = require('./Aspects.js');
module.exports = class Target {
    constructor(target) {
        if(!target) { target = {};}
        this.uuid = target.uuid || '';;
        this.displayName = target.displayName || '';  
        this.className = target.className || '';
        this.costPrice = target.costPrice || '';
        this.aspects = new Aspects(target.aspects);
        this.environmentType = target.environmentType || '';
        this.onDemandRateBefore = target.onDemandRateBefore || 0;
        this.onDemandRateAfter = target.onDemandRateAfter || 0;
    }
}