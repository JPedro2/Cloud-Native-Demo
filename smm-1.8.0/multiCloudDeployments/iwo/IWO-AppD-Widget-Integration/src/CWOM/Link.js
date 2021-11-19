module.exports = class Link {
    constructor(link) {
        if(!link) { link = {}; }
        this.rel = link.rel || '';
        this.href = link.href || '';
    }
};