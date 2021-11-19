var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	var parms = req.body;
	var query = parms.query;
	var start = parseInt(parms.start);
	var end   = parseInt(parms.end);
	var limit     = parseInt(parms.limit);

	req.analyticsManager.query(query,start,end,limit).then(function (results) {
		res.status(200).send(results);
	}, function(error){
		console.log(error);
		res.status(500).send(error.stack);
	}
	);
});

router.post('/restui', function(req, res) {
	var parms = req.body;
	var query = parms.query;
	var start = parseInt(parms.start);
	var end   = parseInt(parms.end);
	var limit     = parseInt(parms.limit);

	req.analyticsManager.restUIADQL(query,start,end,limit).then(function (results) {
		res.status(200).send(results);
		}, function(error){
			console.log(error);
			res.status(500).send(error.stack);
		}
	);
});

module.exports = router;
