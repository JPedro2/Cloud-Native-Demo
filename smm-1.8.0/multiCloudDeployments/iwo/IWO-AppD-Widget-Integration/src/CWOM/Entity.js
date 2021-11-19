var Aspects = require('./Aspects.js');
module.exports = class Entity {
    constructor(entity) {
        if(!entity) { entity = {};}

        this.uuid = entity.uuid || '';
        this.displayName = entity.displayName || '';
        this.className = entity.className || '';
        this.aspects = new Aspects(this.aspects);
    }
};