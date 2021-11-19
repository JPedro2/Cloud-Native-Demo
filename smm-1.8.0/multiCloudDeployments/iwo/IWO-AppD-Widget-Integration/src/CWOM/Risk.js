module.exports = class Risk {
    constructor(risk) {
        if(!risk) { risk = {};}
        this.uuid = risk.uuid || '';
        this.subCategory = risk.subCategory || '';
        this.description = risk.description || '';
        this.severity = risk.severity || '';
        this.reasonCommodity = risk.reasonCommodity || '';
        this.importance = risk.importance || 0;

    }
};
