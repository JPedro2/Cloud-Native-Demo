module.exports = class Location {
    constructor(loc) {
        if(!loc) { loc = {}; }
        this.uuid = loc.uuid || '';
        this.displayName = loc.displayName || ''; 
        this.className = loc.className || '';
    }
};