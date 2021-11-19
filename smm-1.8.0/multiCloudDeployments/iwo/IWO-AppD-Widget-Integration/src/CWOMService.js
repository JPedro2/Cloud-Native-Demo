var rp = require('request-promise').defaults({ jar: true });
var httpSignature = require('http-signature');
const isHelper = require('./IntersightHelper');

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
isHelper.setPublicKey(fs.readFileSync('./keys/iwo_public_key.txt', 'utf8'));
isHelper.setPrivateKey(fs.readFileSync('./keys/iwo_private_key.pem', 'utf8'));








module.exports = class CWOMService {
    constructor(config) {
        this.config = configManager.getIWOConfig();
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


    getTurboActions(businessAppId) {
        var svc = this;
        return new Promise(function (resolve, reject) {
            svc.logger.info("IWO getting actions!");
            var businessid = businessAppId || '';
            svc.getSupplyChainEntities(businessid).then(async function (filtermap) {
                svc.logger.debug('getTurboActions.getTurboToken.getSupplyChainEntities',filtermap);
                svc.getActionsForScope(businessid, filtermap).then(
                    async function (actions) {
                        console.log('getTurboActions.getTurboToken.getSupplyChainEntities.getActionsForScope',actions);
                        resolve(actions);
                    }
                , function (error) {
                    svc.logger.error('getTurboActions.getTurboToken.getSupplyChainEntities.getActionsForScope',error);
                    reject(error)
                })

            });

        });
    }
    /**
     * 
     * @param {*} scopeid 
     * @param {*} filtermap 
     */
    getActionsForScope(scopeid, filtermap) {
        var svc = this;
        return new Promise(resolve => {
            var iwourl = this.config.iwoServer + this.config.iwoAPIPath; 
            /*
            var iwoOptions = {
                method: 'POST',
                uri: iwourl,
                resourcePath: '/actions',
                body: JSON.stringify({
                    "scopes": [scopeid],
                    "actionInput": { "relatedEntityTypes": ["VirtualMachine","ApplicationComponent","Storage","Database","PhysicalMachine","Cluster" ] }
                })
            }*/
            var iwoOptions = {
                method: 'GET',
                uri: iwourl,
                resourcePath: '/entities/'+scopeid+'/actions?ascending=false&disable_hateoas=true&limit='+this.config.limit+'&order_by=severity',
            }
            var iwourl = 'https://intersight.com/wo/api/v3'

            var options = isHelper.prepareRequest(iwoOptions);
            rp(options).then(function (ret) {

                svc.logger.debug('getActionsForScope.rp',ret);
                var actionMap = new Map();
                var actionsret = [];
                //if (ret.length > 100) {

                    var jsonRet = JSON.parse(ret.body);
                    for (var i = 0; i < jsonRet.length; i++) {
                        var ba = jsonRet[i];
                        var actions = jsonRet//ba.actions;
                        if(actions) {
                            for (var j = 0; j < actions.length; j++) {
                                var action = actions[j];
    
                                if (!actionMap.has(action.uuid)) {
                               //     if (filtermap.has(action.target.uuid)) {
                                        actionMap.set(action.uuid, true);
                                        actionsret.push(new Action(action));
                                    }
                                //}
                            }
                        }

                    }
               // }


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
            var iwourl = 'https://intersight.com/wo/api/v3'
            var iwoOptions = {
                method: 'GET',
                uri: iwourl,
                resourcePath: '/supplychains?uuids=' + uuid + '&detail_type=entity&health=true'
            }
           var options = isHelper.prepareRequest(iwoOptions);
            // changed option to signedRequest
            rp(options).then(function (ret) {
                svc.logger.debug('getSupplyChainEntities.rp',ret);
                var entityMap = new Map();
                //if (ret.length > 100) {

                    var jsonRet = JSON.parse(ret.body);
                    var seMap = jsonRet.seMap
                    if (seMap) {
                        for (var type in seMap) {
                            var instancemap = seMap[type].instances;
                            for (var instanceid in instancemap) {
                                entityMap.set(instanceid, true);
                            }
                        }
                    }

                //}
                resolve(entityMap);
            }).catch(function (err) {
                svc.logger.error('getSupplyChainEntities.rp',err);
                throw err;
            });

        }); // end Promise
    }

    

}

