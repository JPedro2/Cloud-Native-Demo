var express = require('express');
var router = express.Router();
var CWOMService = require('../src/CWOMService.js');
var cwomsvc = new CWOMService({});


router.get('/actions/:id', function(req, res) {
    var id = req.params.id;

    cwomsvc.getTurboActions(id).then((actions, entities, num) => {
        var supplyChain = [];
        //var supplyChain = Array.from(cwomsvc.seMap.keys()); 
        for(var i in cwomsvc.seMap)
        
            supplyChain.push([i,cwomsvc.seMap[i]]);
        var results  = {
            supplyChain : supplyChain,
            cwomserver: cwomsvc.config.iwoserver,
            actions : actions
        }
        res.status(200).send(results);
    } , (err) => {
        res.status(500).send({});
    });
});

router.get('/maps/:id', function(req, res) {
    var id = req.params.id;
    cwomsvc.getTurboActions(id).then((actions, entities, num) => {
        var results  = {
            elementi : "giovanni", //cwomsvc.seMap,
            cwomserver: cwomsvc.config.iwoserver,
            actions : actions
        }
        res.status(200).send(results);
    } , (err) => {
        res.status(500).send({});
    });
});

router.get('/mockData', function(req, res) {
    cwomsvc.getTurboActionListMockData(false).then((actions) => {
        var results  = {
            cwomserver: cwomsvc.config.turboserver,
            actions : actions,
            
        }
        res.status(200).send(results);
    } , (err) => {
        res.status(500).send({});
    });
    

	
});

module.exports = router;