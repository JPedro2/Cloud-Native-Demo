module.exports = class Filter {
    constructor(filter) {
        if(!filter) { filter = {};}
        this.type = filter.type || '';
        this.value = filter.value || 0;
    }
};