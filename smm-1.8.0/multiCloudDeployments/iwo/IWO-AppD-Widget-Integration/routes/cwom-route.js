var express = require('express');
var router = express.Router();
var CWOMService = require('../src/CWOMService.js');
var cwomsvc = new CWOMService({});


router.get('/actions/:id', function(req, res) {
    var id = req.params.id;
    cwomsvc.getTurboActions(id).then((actions) => {
        var results  = {
            cwomserver: cwomsvc.config.iwoserver,
            actions : actions
        }
        res.status(200).send(results);
    } , (err) => {
        res.status(500).send({});
    });
});

router.get('/node/:id', function(req, res) {
    var id = req.params.id;
    cwomsvc.getTurboActions(id).then((actions) => {
        var results  = {
            cwomserver: cwomsvc.config.iwoserver,
            actions : actions
        }
        //res.render('index', { title: 'IWO Node Actions:', actions });
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