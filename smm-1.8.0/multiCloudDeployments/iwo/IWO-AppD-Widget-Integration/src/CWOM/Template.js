module.exports = class Template {
    constructor(temp) {
        if(!temp) { temp = {};}

        this.uuid = temp.uuid || '';
        this.displayName = temp.displayName || '';
        this.className = temp.className || '';
        this.discovered = temp.discovered || false;
        this.family = temp.family || '';
    }
};
