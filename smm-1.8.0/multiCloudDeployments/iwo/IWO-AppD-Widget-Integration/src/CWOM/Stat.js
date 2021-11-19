var Filter = require('./Filter.js');
module.exports = class Stat {
    constructor(stat) {
        if(!stat) { stat = {}; }
        this.name = stat.name || '';
        this.units = stat.units || '';
        this.value = stat.value || 0;
        this.filters = [];
        if(!stat.filters) {
            stat.filters = [];
        }
        for(var i = 0; i < stat.filters.length; i++) {
            var filter = stat.filters[i];
            this.filters.push(new Filter(filter));
        }

    }
};