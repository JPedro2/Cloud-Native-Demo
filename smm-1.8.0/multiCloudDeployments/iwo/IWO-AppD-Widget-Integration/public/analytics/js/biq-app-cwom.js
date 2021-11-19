var _cwomIconComponent = "#_cwomIconComponent";
var _cwomPanelComponent = "#_cwomIconPanel";


class CWOMIconComponent extends BaseComponent {
    constructor(options) {
        if (!options.action) {
            options.action = options.title;
        }
        if (options.critcal > 0) {
            options.sevclass = "sevIconCritical";
        } else if (options.major > 0) {
            options.sevclass = "sevIconMajor";
        } else if (options.minor > 0) {
            options.sevclass = "sevIconMinor";
        } else {
            options.sevclass = "sevIconNone";
        }
        options.hasChart = false;
        super(options, null);
    }
    draw(onClick, callback) {
        var options = super.getOptions();
        alert("#" + options.targetId)
        $("#" + options.targetId).html(
            $.templates({ markup: _cwomIconComponent }).render(options)
        );
        if (options.animate) {
            animateDiv(options.targetId, options.animate);
        }
    }

}
class CWOMPanelComponent extends BaseComponent {

    constructor(options) {
        if (!options.action) {
            options.action = options.title;
        }
        options.hasChart = true;
        options.icons = [{type: "ApplicationComponent"},{type: "VirtualMachine"},{type: "Storage"},{type: "Host"},{type: "Database"},{type: "ContainerSpec"},{type: "ContainerPod"},{type: "WorkloadController"},{type: "Volumes"},{type: "VirtualVolume"}];
        //options.selectedFilter = 'none';
        super(options, null);
    }
    draw( callback) {
        var options = super.getOptions();

        //$("#" + options.targetId).html(
        var container = "#" + options.targetId;
        $.views.helpers({
            actionFilter: function (action, index, actions) {
                var view = this;
                var type = view.ctxPrm("selectedFilter") || "";
                var critOnly = view.ctxPrm("critOnly");
                var actionCat = view.ctxPrm("actionCat")

                var actionCatEff = view.ctxPrm("actionCatEff")
                var actionCatPerf = view.ctxPrm("actionCatPerf")
                var actionCatPrev = view.ctxPrm("actionCatPrev")
                var actionCatComp = view.ctxPrm("actionCatComp")

                var correct_class = action.target.className === type;
                var matches_filter = correct_class;
                if (critOnly) {
                    matches_filter = correct_class && action.risk.severity === "CRITICAL";
                } else if (actionCatEff) {
                    matches_filter = correct_class && action.risk.subCategory === "Efficiency Improvement";
                } else if (actionCatPerf) {
                    matches_filter = correct_class && action.risk.subCategory === "Performance Assurance";
                } else if (actionCatPrev) {
                    matches_filter = correct_class && action.risk.subCategory === "Prevention";
                } else if (actionCatComp) {
                    matches_filter = correct_class && action.risk.subCategory === "Compliance";
                }
                return matches_filter;
            },
            actionDetailFilter: function (action, index, actions) {
                var view = this;
                var detailID = view.ctxPrm("detailID") || "";
                var critOnly = view.ctxPrm("critOnly");
                var actionCat = view.ctxPrm("actionCat")
                var correct_action = action.uuid === detailID;
                var matches_filter = correct_action;
                if (critOnly) {
                    matches_filter = correct_action && action.risk.severity === "CRITICAL";
                } else if (actionCat) {
                    matches_filter = correct_action && action.risk.subCategory === "Efficiency Improvement";
                }
                return matches_filter;
            },
            executeAction : function(uuid, ev, eventArgs) {
                console.log(uuid);
                var index = options.actions.map(function(e) { return e.uuid; }).indexOf(uuid);
                console.log(index);
                $.observable(options.actions).remove(index);
                return false;
            },
            hasActions: function(type, actions, critOnly, actionCatComp, actionCatEff, actionCatPerf, actionCatPrev) {
                // Efficiency Improvement, Performance Assurance, Prevention, Compliance
                if(type && actions) {
                    var subactions = actions.filter(action => action.target.className === type);

                    if(critOnly) {
                        return subactions.filter(action => action.risk.severity === 'CRITICAL').length > 0
                    } else if(actionCatEff) {
                        return subactions.filter(action => action.risk.subCategory === 'Efficiency Improvement').length > 0
                    } else if(actionCatPerf) {
                        return subactions.filter(action => action.risk.subCategory === 'Performance Assurance').length > 0
                    } else if(actionCatPrev) {
                        return subactions.filter(action => action.risk.subCategory === 'Prevention').length > 0
                    } else if(actionCatComp) {
                        return subactions.filter(action => action.risk.subCategory === 'Compliance').length > 0
                    } else {
                        return subactions.length > 0;
                    }
            
                    
                } else  {
                    return false;
                }
                
            }
            
        });
        $.views.helpers.actionFilter.depends = ["~selectedFilter", "~critOnly", "~actionCat"];
        $.views.helpers.actionDetailFilter.depends = ["~detailID", "~critOnly", "~actionCat"];

        var tmpl = $.templates({
            markup: _cwomPanelComponent,
            converters: {
                getHost: function(target, type) {
                    if(type === "ApplicationServer") {
                        return target.displayName.substring(target.displayName.indexOf(",")+1, target.displayName.indexOf("]"));
                    } else if (type === "VirtualMachine") {
                        return target.aspects.virtualMachineAspect.os;
                    } else {
                        return target.displayName;
                    }

                },
                urlEncoder: function(uri) {
                    return encodeURIComponent(uri);
                },
                getIp: function(target, type) {
                    if(type === "ApplicationServer") {
                        return target.displayName.substring(target.displayName.indexOf("[")+1, target.displayName.indexOf(","));s
                    } else if (type === "VirtualMachine") {
                        return target.aspects.virtualMachineAspect.ip;
                    }
                }, 
                getRiskClass: function(risk) {
                    var cssclass = "brown-text";
                    if(risk === "Efficiency Improvement") {
                        cssclass = "teal-text";
                    } else if (risk === "Performance Assurance") {
                        cssclass = "pink-text";
                    }
                    return cssclass;
                },
                getStatsValueText: function(stats) {
                    if(!stats) { 
                        return "";
                    }
                    if(stats.length === 0) {
                        return "";
                    }
                    var statsValueText = "";
                    var statsValueType = (stats[0].units === "$/h" ? " / HR" : "");
                  
                    if (0 > stats[0].value) {
                      statsValueText = "<small> EST. INVESTMENT: <span class='brown-text'>$ " + (stats[0].value * -1) + " " + statsValueType + "</span></small>";
                    }
                    else {
                      statsValueText = "<small> EST. SAVINGS: <span class='teal-text'>$ " + stats[0].value + " / HR</span></small>";
                    }
                    return statsValueText;
                },
                
                getIconClass: function(type, actions, critOnly) {
                    var subactions = actions.filter(action => action.target.className === type);
                    if(subactions.filter(action => action.risk.severity === 'CRITICAL').length > 0) {
                        return 'sevIconCritical';
                    } else if(subactions.filter(action => action.risk.severity === 'MAJOR').length > 0 && !critOnly) {
                        return 'sevIconMajor';
                    } else if(subactions.filter(action => action.risk.severity === 'MINOR').length > 0 && !critOnly) {
                        return 'sevIconMinor';
                    } else {
                        return 'sevIconNone';
                    }
                

                },
                countSeverity: function(actions, type, severity, critOnly) {
                    var subactions = actions.filter(action => action.target.className === type);
                    if(critOnly && severity !== "CRITICAL") {
                        return 0;
                    } else {
                        var count = subactions.filter(action => action.risk.severity === severity).length;
                    }
                    

                    return count;
                },
                actionCount: function (actions, critOnly, actionCatEff, actionCatPrev, actionCatPerf, actionCatComp) {
                    var count = 0;
                    if(critOnly) {
                        return actions.filter(action => action.risk.severity === 'CRITICAL').length;
                    } else if(actionCatEff) {
                        return actions.filter(action => action.risk.subCategory === 'Efficiency Improvement').length;
                    } else if(actionCatPrev) {
                        return actions.filter(action => action.risk.subCategory === 'Prevention').length;
                    }else if(actionCatPerf) {
                        return actions.filter(action => action.risk.subCategory === 'Performance Assurance').length;
                    }else if(actionCatComp) {
                        return actions.filter(action => action.risk.subCategory === 'Compliance').length;
                    } else {
                        return actions.length;
                    }
                },
                getval: function (reasonCommodity, newValue, displayValue) {
                    reasonCommodity = reasonCommodity ? reasonCommodity : '';
                    var formatBytes = function (a, b) {
                        if (0 == a)
                            return "0 Bytes";
                        a = a * 1024;
                        var c = 1024,
                            d = b || 2,
                            e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
                            f = Math.floor(Math.log(a) / Math.log(c));

                        return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
                    }
                    var ret = displayValue;
                    if (reasonCommodity.toUpperCase() === "VMEM" || reasonCommodity.toUpperCase() === "HEAP" ) {
                        if (newValue > 1024) {
                            ret = formatBytes(displayValue, 1);
                        }

                    }
                    return ret;
                },
                actionDescription: function (newValue, currentValue, risk) {
                     return (newValue > currentValue ? "Scale Up" : "Scale Down") + " " + risk.reasonCommodity;
                },
                host: function (displayName) {
                    return displayName.substring(displayName.indexOf(",") + 1, displayName.indexOf("]"));

                },
                ip: function (displayName) {
                    return displayName.substring(displayName.indexOf("[") + 1, displayName.indexOf(","))
                },
                targetDisplay: function (target, type) {
                    var ret = '';
                    if (type === "ApplicationServer") {
                        ret = target.displayName.substring(target.displayName.indexOf(",") + 1, target.displayName.indexOf("]"));
                    } else {
                        ret = target.displayName;
                    }
                    return ret;
                }

            }
        });
        //  .render(options, )
        tmpl.link(container, options, {
            selectedFilter: 'none',
            critOnly: false,
            actionCatComp: false, 
            actionCatEff: false, 
            actionCatPerf: false, 
            actionCatPrev: false,
            actionCat: false,
            detailID: '',
            updateFilter: function (newfilter, ev, eventArgs) {
                var view = eventArgs.view;
                view.ctxPrm("detailID", '');
                view.ctxPrm("selectedFilter", newfilter);
            },
            updateFilterDetails: function (detailID, ev, eventArgs) {
                var view = eventArgs.view;
                var currentID = view.ctxPrm("detailID");
                if(detailID === currentID) {
                    detailID = '';
                }
                view.ctxPrm("detailID", detailID);
            }

        });

        if (options.animate) {
            animateDiv(options.targetId, options.animate);
        }
        if (callback) {
            callback(this.options);
        }
    }
}



