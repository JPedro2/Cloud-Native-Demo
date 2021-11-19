var NumberCounts = require('./NumberCounts.js');
module.exports = class RICoverage {
    constructor(ricov) {
        if(!ricov) { ricov = {}; }
        this.capacity = new NumberCounts(ricov.capacity);
        this.units = ricov.units || '';
        this.values = new NumberCounts(ricov.values);
        this.value = ricov.value || 0;
    }
};