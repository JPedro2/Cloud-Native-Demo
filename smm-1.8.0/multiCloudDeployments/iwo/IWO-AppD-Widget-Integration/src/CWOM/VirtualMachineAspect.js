module.exports = class VirtualMachineAspect {
    constructor(vma) {
        if(!vma) { vma = {};}

        this.os = vma.os || '';
        this.ebsOptimized = vma.ebsOptimized || false;
        this.numVCPUs = vma.numVCPUs || 0;
        this.ip = vma.ip || [];
        
    }
};