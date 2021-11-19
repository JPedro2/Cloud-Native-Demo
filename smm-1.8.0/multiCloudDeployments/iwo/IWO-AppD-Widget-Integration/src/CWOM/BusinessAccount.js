module.exports = class BusinessAccount {
    constructor(ba) {
        if(!ba) { ba = {};}
        this.uuid = ba.uuid || '';
        this.displayName = ba.displayName || '';
    }
};