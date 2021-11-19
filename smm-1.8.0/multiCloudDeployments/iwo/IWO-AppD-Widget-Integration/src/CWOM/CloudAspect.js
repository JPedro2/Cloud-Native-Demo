var RICoverage = require('./RICoverage.js');
var BusinessAccount = require('./BusinessAccount.js');
module.exports = class CloudAspect {
    constructor(ca) {
        if(!ca) { ca = {};}
        this.businessAccount = new BusinessAccount(ca.businessAccount);
        this.riCoveragePercentage = ca.riCoveragePercentage || 0;
        this.riCoverage = new RICoverage(ca.riCoverage);
    }
};