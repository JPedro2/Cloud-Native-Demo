module.exports = class NumberCounts {
    constructor(nc) {
        if(!nc) { nc = {}; }
        this.max = nc.max || 0;
        this.min = nc.min || 0;
        this.avg = nc.avg || 0;
        this.total = nc.total || 0;
    }
};