var rp = require('request-promise').defaults({ jar: true });
var httpSignature = require('http-signature');
const isREST = require('intersight-rest');

var configManager = require("./ConfigManager.js");
var Action = require("./CWOM/Action.js");
const uuidv4 = require('uuid/v4');
const winston = require('winston');
function getRandomInt(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //(inclusive, exclusive)
}
var severitys = ["CRITICAL", "MAJOR", "MINOR"];

// Load Public/Private Keys
const fs = require('fs');
isREST.setPublicKey(fs.readFileSync('./public_key.txt', 'utf8'));
isREST.setPrivateKey(fs.readFileSync('./private_key.pem', 'utf8'));








module.exports = class CWOMService {
    constructor(config) {
        this.config = configManager.getCWOMConfig();
        //this.config = configManager.getIWOConfig();
        const loglevel = configManager.getLogLevel();
        this.authToken = "";
        this.logger = winston.createLogger({
            level: loglevel || 'info',
            format: winston.format.json(),
            defaultMeta: { service: 'CWOMService' },
            transports: [
              new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 1024 * 1024 * 20}),
              new winston.transports.File({ filename: 'logs/combined.log', maxsize: 1024 * 1024 * 20 }),

            ]
          });

    }

    getBizAppAction(bizAppID) {
        console.log("==================="+ bizAppID + "========================");
        var postBody = {
            environmentType: "HYBRID",
            detailLevel: "EXECUTION"
        };
    
        var myOptions = {
            httpMethod: 'post',
            resourcePath: '/entities/' + bizAppID + '/actions',
            body: postBody
        };
        var iSightOption = isREST.prepareRequest(myOptions);
        console.log("===================" + iSightOption);
        /*
        isREST.intersightREST(myOptions).then(response => {
            console.log("===========================================");
            console.log(response.body);
            console.log("===========================================");
        }).catch(err => {
            console.log('Error: ', err);
        });
        */
    }

    getTurboToken() {
        var svc = this;
        svc.logger.debug('getTurboToken.Getting Turbo Token');

        return new Promise(function (resolve, reject) {

            
            var turbourl = svc.config.turboserver + '/api/v3/login?disable_hateoas=true';
            var authorization = 'Basic ' + Buffer.from(`${svc.config.username}:${svc.config.password}`).toString("base64");
            var headers = { 'Authorization': authorization, 'Content-Type': 'multipart/form-data' };
            var params = { 'username': svc.config.username, 'password': svc.config.password };

            var _include_headers = function (body, response, resolveWithFullResponse) {
                return { 'headers': response.headers, 'data': body };
            };


            var options = {
                encoding: 'UTF-8',
                method: 'POST',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers,
                form: params,
                transform: _include_headers
            };
            



            rp(options).then(function (ret) {
                //console.log('Return from Turbo Token: ' + JSON.stringify(ret));
                //console.log('Response Headers from Turbo Token: ' + JSON.stringify(ret.headers));
                svc.logger.debug('getTurboToken.rp', ret);
                resolve(ret);
            }).catch(function (err) {

                svc.logger.error('getTurboToken.rp', err);
                throw err;
            });
        });
        
    }
    /// NO
    ///Scaling action that is not on VM for Business App, throw out.
    getActionsByScope(scopeid) {
        var svc = this;
        svc.logger.silly('getActionsByScope');
        return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/api/v3/actions';
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };

            rp(options).then(function (ret) {
                var jsonret = JSON.parse(ret);
                svc.logger.debug('getActionsByScope.rp', jsonret);
                var businessappwidgets = jsonret[0];

                var idmap = {}
                var entityidlist = [];

                if (businessappwidgets.scope === svc.config.businessApplicationId) {
                    var widgets = businessappwidgets.widgets;
                    for (var i = 0; i < widgets.length; i++) {
                        var widget = widgets[i];
                        if (widget.type == "pendingActions") {
                            //GROUP ID?
                            entityidlist.push(widget.scope.uuid);
                        }
                    }
                }
                resolve(entityidlist);
            }).catch(function (err) {
                svc.logger.error('getActionsByScope.rp',err);
                throw err;
            });

        }); // end Promise

    }
    getWidgets() {
        var svc = this;
        svc.logger.silly('getWidgets');
        return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/api/v3/widgetsets?category=OVERVIEW&disable_hateoas=true&scope_type=Hybrid_BusinessApplication';
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };

            rp(options).then(function (ret) {
                var jsonret = JSON.parse(ret);
                svc.logger.debug('getWidgets.rp', jsonret);
                var businessappwidgets = jsonret[0];

                var idmap = {}
                var entityidlist = [];

                if (businessappwidgets.scope === svc.config.businessApplicationId) {
                    var widgets = businessappwidgets.widgets;
                    for (var i = 0; i < widgets.length; i++) {
                        var widget = widgets[i];
                        if (widget.type == "pendingActions") {
                            //GROUP ID?
                            entityidlist.push(widget.scope.uuid);
                        }
                    }
                }
                resolve(entityidlist);
            }).catch(function (err) {
                svc.logger.error('getWidgets.rp', err);
                throw err;
            });

        }); // end Promise

    }
    getGroup() {
        var svc = this;
        return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/api/v3/rest/groups/';
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'POST',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers,
                body: JSON.stringify({
                    isStatic: true,
                    scope: [svc.uuid]
                })
            };

            rp(options).then(function (ret) {
                var jsonret = JSON.parse(ret);
                svc.logger.debug('getGroup.rp', jsonret);
                var seMap = jsonret.seMap;
                var idmap = {}
                var entityidlist = [];
                if (seMap) {
                    for (var entityname in seMap) {

                        var entity = seMap[entityname];
                        for (var id in entity.instances) {
                            entityidlist.push(id);
                        }
                        idmap[entityname] = entityidlist;
                    }

                }
                resolve(entityidlist);
            }).catch(function (err) {
                console.log(JSON.stringify(err));
                throw err;
            });

        }); // end Promise


    }
    getBusinessApplicationActions() {
        var svc = this;
          return new Promise(function (resolve, reject) {
            svc.logger.debug('getBusinessApplicationActions.init');
            svc.getTurboToken().then(async function (tokenret) {
                svc.logger.debug('getBusinessApplicationActions.getTurboToken',tokenret);
                var bodyreturn = JSON.parse(tokenret.data);
                var headerreturn = tokenret.headers;
                svc.authToken = bodyreturn.authToken;
                svc.getWidgets().then(async (groupidlist) => {
                    svc.logger.debug('getBusinessApplicationActions.getWidgets',groupidlist);
                    svc.getGroupListActions(groupidlist).then(async function (actions) {
                        svc.logger.debug('getBusinessApplicationActions.getGroupListActions',actions);
                        resolve(actions);
                    });
                });
            }).catch(function (rej) { svc.logger.error('getBusinessApplicationActions.error', rej); });

        });
    }

    //Used if I want to get SeMap
    getAllBusinessAppEntities() {

        var svc = this;
       return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/api/v3/entities/' + svc.config.businessApplicationId + "/supplychains?entity_states=&detail_type=entity&health=true";
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };

            rp(options).then(function (ret) {
                var jsonret = JSON.parse(ret);
                svc.logger.debug('getAllBusinessAppEntities.rp', jsonret);
                var seMap = jsonret.seMap;
                var idmap = {}
                var entityidlist = [];
                if (seMap) {
                    for (var entityname in seMap) {

                        var entity = seMap[entityname];
                        for (var id in entity.instances) {
                            entityidlist.push(id);
                        }
                        idmap[entityname] = entityidlist;
                    }

                }
                resolve(entityidlist);
            }).catch(function (err) {
                svc.logger.error('getAllBusinessAppEntities.rp', err);
                throw err;
            });

        }); // end Promise

    }

    getGroupListActions(groupidlist) {
        var svc = this;
        return new Promise(function (resolve, reject) {

            let promisedActions = [];
            for (var i = 0; i < groupidlist.length; i++) {
                promisedActions.push(svc.getTurboGroupActions(groupidlist[i]));
            }
            svc.logger.debug(`getGroupListActions - Getting ${promisedActions.length} promised actions`);
            Promise.all(promisedActions).then(function (resultData) {
                var actions = [];
                svc.logger.debug('getGroupListActions.Promise.all', resultData);
                //console.log("===> Total Actions Returned: " + resultData.length);
                for (var x = 0; x < resultData.length; x++) {
                    var newAction = resultData[x];
                    if (newAction != null && newAction.length > 0) {

                        for (var w = 0; w < newAction.length; w++) {
                            var thisAction = newAction[w];
                            //console.log("===> Validating Action: " + thisAction.uuid + " of type: " + thisAction.target.className);
                            actions.push(thisAction);
                        }
                    } // end if null
                }

                resolve(actions);


            }).catch(function (rej) { svc.logger.error('getGroupListActions.Promise.all', rej); reject(rej) });

        });

    }
    getTurboGroupActions(uuid, entityidlist) {
        var svc = this;
        return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/api/v3/rest/groups/' + uuid + "/actions";
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };
            
            rp(options).then(function (ret) {
                svc.logger.debug('getTurboGroupActions.rp', ret);
                if (ret.length > 100) {
                    var actionslist = [];
                    var myactionreturn = JSON.parse(ret);
                    var actionIDMap = new Map();


                    for (var i = 0; i < myactionreturn.length; i++) {
                        var thisAction = new Action(myactionreturn[i]);
                        var targetid = thisAction.target.uuid;
                        actionslist.push(thisAction);
                    }
                    resolve(actionslist);

                } else { resolve(null); }
            }).catch(function (err) {
                svc.logger.error('getTurboGroupActions.rp', err);
                throw err;
            });

        }); // end Promise

    }
    getTurboActionList(critOnly, supplyChain, uniqueID) {
        var svc = this;

        return new Promise(function (resolve, reject) {

            svc.getTurboActions(critOnly).then(function (actions) {
                svc.logger.debug('getTurboActionList.getTurboActions', actions);

                //console.log("::::::: got turbo actions! Total VM Actions: " + actions.filter(action => "VirtualMachine" === action.target.className).length + " | Total AS Actions: " + actions.filter(action => "ApplicationServer" === action.target.className).length);
                //console.log("refreshing actions with critOnly = " + critOnly);
                var myCrit = (critOnly ? "true" : "false");

                //if (supplyChain) { getApplicationSupplyChain(authToken, uuid); }

                //console.log("----> Returning data to page with uniqueID: " + uniqueID);
                resolve(actions)
                //io.emit('refreshactions', { turboactions: htmlact, critOnly: myCrit, uniqueID: uniqueID });

            }).catch(function (rej) { svc.logger.error('getTurboActionList.getTurboActions', rej); });

        });
    }
    //THISONE entry ==============================
    getTurboActions(businessAppId) {

        //
        // Only bring actions from these VMs (Highlighted in the demo flow)
        //
        var svc = this;
        r

        return new Promise(function (resolve, reject) {
            // Code change to adapt IWO
            var businessid = businessAppId || '';
            svc.getSupplyChainEntities(businessid).then(async function (filtermap) {
                svc.logger.debug('getTurboActions.getTurboToken.getSupplyChainEntities',filtermap);
                svc.getActionsForScope(businessid, filtermap).then(
                    async function (actions) {
                        svc.logger.debug('getTurboActions.getTurboToken.getSupplyChainEntities.getActionsForScope',actions);
                        resolve(actions);
                    }
                , function (error) {
                    svc.logger.error('getTurboActions.getTurboToken.getSupplyChainEntities.getActionsForScope',error);
                    reject(error)
                })

            });

            // end Code Change
            //console.log("getting turbo actions!");
            svc.logger.debug('getTurboActions.Promise');
            svc.getTurboToken().then(async function (tokenret) {
                
                svc.logger.debug('getTurboActions.getTurboToken',tokenret);

                var bodyreturn = JSON.parse(tokenret.data);
                var headerreturn = tokenret.headers;

                svc.authToken = bodyreturn.authToken;
                var businessid = businessAppId || '';
                svc.getSupplyChainEntities(businessid).then(async function (filtermap) {
                    svc.logger.debug('getTurboActions.getTurboToken.getSupplyChainEntities',filtermap);
                    svc.getActionsForScope(businessid, filtermap).then(
                        async function (actions) {
                            svc.logger.debug('getTurboActions.getTurboToken.getSupplyChainEntities.getActionsForScope',actions);
                            resolve(actions);
                        }
                    , function (error) {
                        svc.logger.error('getTurboActions.getTurboToken.getSupplyChainEntities.getActionsForScope',error);
                        reject(error)
                    })

                });


            }, (error) => {
                svc.logger.error('getTurboActions', error);
            }).catch(function (rej) { svc.logger.error('getTurboActions.catch', rej); });

        });
    }
    getActionsForScope(scopeid, filtermap) {
        var svc = this;
        return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/api/v3/actions';
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'POST',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers,
                body: JSON.stringify({
                    "scopes": [scopeid],
                    "actionInput": { "relatedEntityTypes": ["VirtualMachine","ApplicationComponent","Storage","Database","PhysicalMachine" ] }
                })
            };

            rp(options).then(function (ret) {

                svc.logger.debug('getActionsForScope.rp',ret);
                var actionMap = new Map();
                var actionsret = [];
                if (ret.length > 100) {

                    var jsonRet = JSON.parse(ret);
                    for (var i = 0; i < jsonRet.length; i++) {
                        var ba = jsonRet[i];
                        var actions = ba.actions;
                        if(actions) {
                            for (var j = 0; j < actions.length; j++) {
                                var action = actions[j];
    
                                if (!actionMap.has(action.uuid)) {
                                    if (filtermap.has(action.target.uuid)) {
                                        actionMap.set(action.uuid, true);
                                        actionsret.push(new Action(action));
                                    }
                                }
                            }
                        }

                    }
                }


                resolve(actionsret);
            },(error) => {
                svc.logger.error('getActionsForScope.rp',error);
                resolve([]);
            });

        }, reject => { reject(error)}); // end Promise

    }
    getSupplyChainEntities(uuid) {

        var svc = this;
        return new Promise(resolve => {
            var iwourl = svc.config.iwoserver + '/supplychains?uuids=' + uuid + '&detail_type=entity&health=true';
            var iwoOptions = {
                method: 'GET',
                uri: iwourl,
            }

            //var signedRequest = isREST.genereateIWORequest(iwourl, null, null, iwoOptions);

            var turbourl = svc.config.turboserver + '/api/v3/supplychains?uuids=' + uuid + '&detail_type=entity&health=true';
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };
            // changed option to signedRequest
            rp(options).then(function (ret) {
                svc.logger.debug('getSupplyChainEntities.rp',ret);
                var entityMap = new Map();
                if (ret.length > 100) {

                    var jsonRet = JSON.parse(ret);
                    var seMap = jsonRet.seMap
                    if (seMap) {
                        for (var type in seMap) {
                            var instancemap = seMap[type].instances;
                            for (var instanceid in instancemap) {
                                entityMap.set(instanceid, true);
                            }
                        }
                    }

                }
                resolve(entityMap);
            }).catch(function (err) {
                svc.logger.error('getSupplyChainEntities.rp',err);
                throw err;
            });

        }); // end Promise
    }

    getAppServerList(uuid) {
        var svc = this;
        return new Promise(resolve => {
            var asList = [];
            var turbourl = svc.config.turboserver + '/api/v3/entities/' + uuid;
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };

            rp(options).then(function (ret) {
                var entityreturn = JSON.parse(ret);
                var fullList = entityreturn.providers;
                for (var x = 0; x < fullList.length; x++) {
                    //console.log("====> APP Server Found: " + fullList[x].displayName);
                    asList.push(fullList[x].uuid);
                }
                //console.log("Got List of App Servers: " + JSON.stringify(asList));
                resolve(asList);

            }).catch(function (err) {
                console.log(JSON.stringify(err));
                throw err;
            });

        }); // end Promise


    }
    getTurboVMAction(uuid, critOnly) {
        var svc = this;
        return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/api/v3/entities/' + uuid + "/actions";
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };

            rp(options).then(function (ret) {
                svc.logger.debug('getTurboVMAction.rp',ret);
                if (ret.length > 100) {
                    var allVMActions = [];
                    var myactionreturn = JSON.parse(ret);

                    for (var i = 0; i < myactionreturn.length; i++) {
                        var thisAction = new Action(myactionreturn[i]);                       
                        if (thisAction.target.className === "VirtualMachine") {

                            if (!critOnly) {
                                //resolve(thisAction);
                                allVMActions.push(thisAction);
                            }
                            else if (critOnly && thisAction.risk.severity === "CRITICAL") {
                                //resolve(thisAction);
                                allVMActions.push(thisAction);
                            }
                        }
                        
                        //else { resolve(null); }
                    }
                    //resolve(allActions);
                    resolve(allVMActions);

                } else { resolve(null); }
            }).catch(function (err) {
                svc.logger.error('getTurboVMAction.rp',err);
                throw err;
            });

        }); // end Promise
    }

    getTurboAppServerAction(uuid, critOnly) {
        var svc = this;
        return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/api/v3/entities/' + uuid + '/actions';
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };

            rp(options).then(function (ret) {
                svc.logger.debug('getTurboAppServerAction.rp',ret);
                //console.log("====> Result: " + ret);
                if (ret.length > 100) {
                    var allASActions = [];
                    var myactionreturn = JSON.parse(ret);

                    for (var i = 0; i < myactionreturn.length; i++) {
                        var thisAction = new Action(myactionreturn[i]);

                        //console.log("Returning Action: " + thisAction.getActionID() + " for App Server");
                        if (!critOnly) { allASActions.push(thisAction); }
                        else if (critOnly && thisAction.risk.severity === "CRITICAL") {
                            allASActions.push(thisAction);
                        } else { resolve(null); }
                    }
                }
                else { resolve(null); }
                resolve(allASActions);

            }).catch(function (err) {
                svc.logger.error('getTurboAppServerAction.rp',err);
                throw err;
            });

        }); // end Promise
    }
    getTurboActionListMockData(critOnly, supplyChain, uniqueID) {
        var svc = this;

        return new Promise(function (resolve, reject) {
            var actions = [];
            //3,6
            for (var i = 0; i < getRandomInt(40, 60); i++) {
                actions.push(svc.getMockAppServerAction(severitys[getRandomInt(0, 3)]))
            }
            for (var i = 0; i < getRandomInt(1, 6); i++) {
                actions.push(svc.getMockVirtualServerAction(severitys[getRandomInt(0, 3)]))
            }
            resolve(actions);
        });
    }
    getMockVirtualServerAction(severity) {
        var serverName = "Cisco - APPCWOM" + getRandomInt(1, 20);
        var VMEM = getRandomInt(13000000, 23000000);
        var VMEMDown = VMEM - getRandomInt(4000000, 11000000);
        return new Action({
            "uuid": uuidv4(),
            "createTime": "2019-06-20T11:58:31-04:00",
            "actionType": "RIGHT_SIZE",
            "actionState": "PENDING_ACCEPT",
            "actionMode": "MANUAL",
            "details": "Scale VirtualMachine " + serverName + " from m5.xlarge to c5.large",
            "importance": 0,
            "target": {
                "uuid": uuidv4(),
                "displayName": serverName,
                "className": "VirtualMachine",
                "costPrice": 0.085,
                "aspects": {
                    "virtualMachineAspect": {
                        "os": "cwom-base",
                        "ip": [
                            "127.0.0.1"
                        ],
                        "numVCPUs": 4,
                        "ebsOptimized": true
                    },
                    "cloudAspect": {
                        "businessAccount": {
                            "uuid": uuidv4(),
                            "displayName": uuidv4()
                        },
                        "riCoveragePercentage": 0,
                        "riCoverage": {
                            "capacity": {
                                "max": 32,
                                "min": 32,
                                "avg": 32
                            },
                            "units": "RICoupon",
                            "values": {
                                "max": 0,
                                "min": 0,
                                "avg": 0,
                                "total": 0
                            },
                            "value": 0
                        }
                    }
                },
                "environmentType": "CLOUD",
                "onDemandRateBefore": 0.192,
                "onDemandRateAfter": 0.085
            },
            "currentEntity": {
                "uuid": "aws::VMPROFILE::m5.xlarge",
                "displayName": "m5.xlarge",
                "className": "VirtualMachineProfile"
            },
            "newEntity": {
                "uuid": "aws::VMPROFILE::c5.large",
                "displayName": "c5.large",
                "className": "VirtualMachineProfile",
                "aspects": {
                    "virtualMachineAspect": {
                        "os": "Unknown",
                        "ebsOptimized": false
                    }
                }
            },
            "currentValue": VMEM,
            "newValue": VMEMDown,
            "resizeToValue": VMEMDown,
            "template": {
                "uuid": "aws::VMPROFILE::c5.large",
                "displayName": "c5.large",
                "className": "VirtualMachineProfile",
                "discovered": false,
                "family": "c5"
            },
            "risk": {
                "uuid": "_QBP1UJN0Eem6Jsy0e5ifgw",
                "subCategory": "Efficiency Improvement",
                "description": "Matching VirtualMachine needs: CPU 1 Core, Virtual Memory 2.31 GB",
                "severity": severity,
                "reasonCommodity": "VMem",
                "importance": 0
            },
            "stats": [
                {
                    "name": "costPrice",
                    "filters": [
                        {
                            "type": "savingsType",
                            "value": "savings"
                        }
                    ],
                    "units": "$/h",
                    "value": 0.107
                }
            ],
            "currentLocation": {
                "uuid": "aws::us-west-2::DC::us-west-2",
                "displayName": "aws-US West (Oregon)",
                "className": "DataCenter"
            },
            "newLocation": {
                "uuid": "aws::us-west-2::DC::us-west-2",
                "displayName": "aws-US West (Oregon)",
                "className": "DataCenter"
            },
            "actionID": uuidv4()
        })
    }
    getMockAppServerAction(severity) {
        var serverName = "Mock AppDynamics Application Server[127.0.0.1,Mock:Server" + getRandomInt(1, 20) + "]";
        var threads = getRandomInt(100, 250);
        var threadsnew = threads - getRandomInt(1, 50);
        var scaleText = '';
        var risk = '';
        if (getRandomInt(0, 2)) {
            scaleText = "Scale up";
            risk = "Performance Assurance";
            var temp = threads;
            threads = threadsnew;
            threadsnew = temp;

        } else {
            scaleText = "Scale down";
            risk = "Efficiency Improvement";
        }
        return new Action({
            "uuid": uuidv4(),
            "createTime": "2019-07-05T12:12:41-04:00",
            "actionType": "RIGHT_SIZE",
            "actionState": "RECOMMENDED",
            "actionMode": "RECOMMEND",
            "details": scaleText + " Threads for " + serverName + " from " + threads + " Threads to " + threadsnew + " Threads",
            "importance": 0,
            "target": {
                "uuid": uuidv4(),
                "displayName": serverName,
                "className": "ApplicationServer",
                "environmentType": "ONPREM"
            },
            "currentEntity": {
                "uuid": uuidv4(),
                "className": "Threads"
            },
            "newEntity": {
                "uuid": uuidv4(),
                "className": "Threads"
            },
            "currentValue": threads,
            "newValue": threadsnew,
            "resizeToValue": threadsnew,
            "risk": {
                "uuid": uuidv4(),
                "subCategory": risk,
                "description": "Underutilized Threads in Application Server '" + serverName + "'",
                "severity": severity || "MINOR",
                "reasonCommodity": "Threads",
                "importance": 0
            },
            "actionID": uuidv4()
        })
    }

}

// class Provider {
//     constructor(prov) {
//         if(!prov) { prov = {};}
//         this.uuid = prov.uuid || '';
//         this.displayName = prov.displayName || '';
//         this.className = prov.className || '';
//     }
// }




// class Person {
//     constructor(per) {
//         if(!per) { per = {};}
//         this.uuid = per.uuid || '';
//         this.displayName = per.displayName || '';
//         this.type = per.type || '';
//     }
// }
