var VirtualMachineAspect = require('./VirtualMachineAspect.js');
var CloudAspect = require('./CloudAspect.js');
module.exports = class Aspects {
    constructor(aspects) {
        if(!aspects) { aspects = {};}
        this.virtualMachineAspect = new VirtualMachineAspect(aspects.virtualMachineAspect);
        this.cloudAspect = new CloudAspect(aspects.cloudAspect);

    }
};