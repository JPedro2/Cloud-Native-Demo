var log4js = require('log4js');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config.json');

var restManager = require('./src/RestManager.js');
var configManager = require('./src/ConfigManager.js');
var analyticsManager = require('./src/AnalyticsManager.js');
var analyticsRoute = require('./routes/analytics-route.js');

var cwomRoute = require('./routes/cwom-route.js');

var log = log4js.getLogger("app");
var app = express();

console.log("App running on port :" + configManager.getLocalPort());

app.use(function (req, res, next) {
    req.restManager = restManager;
    req.analyticsManager = analyticsManager;
    res.locals.controller = configManager.getControllerUrl();
    res.locals.version = configManager.getVersion();
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.get('/public/webpack/*', function (req, res) {
    res.sendFile(__dirname + req.url);
});
app.use(express.static(__dirname + '/public/webpack'));


app.use(express.static(__dirname + '/src'));
app.get('/public/images/*', function (req, res) {
    res.sendFile(__dirname + req.url);
});
app.use(express.static(__dirname + '/public/images'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/analytics', analyticsRoute);
app.use('/cwom', cwomRoute);


app.get('/', function (req, res) {
    res.redirect('/views/index.html');
});

app.get('/views/index.html', function (req, res) {
    res.render('index.html');
});

if (configManager.getLibraries()) {
    configManager.getLibraries().forEach(function (library) {
        var url = "/node_modules/" + library;
        console.log("Adding Library Path : " + url);
        app.get(url, function (req, res) {
            res.sendFile(__dirname + url);
        });

    });
}
if (configManager.getDashboards()) {
    configManager.getDashboards().forEach(function (dashboard) {
        dashboard.views.forEach(function (view) {
            var viewUrl = "";
            if (dashboard.path.length > 1) {
                viewUrl = dashboard.path + "/" + view;
            } else {
                viewUrl = "/" + view;
            }
            var path = "/views" + viewUrl;
            console.log("registring : " + path);
            app.get(path, function (req, res) {
                //console.log(".."+req.path);
                res.render(".." + req.path);
            });
        });
    });
}

// //  "actionTypeList": [
//     "NONE"
// ],

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error(req.originalUrl, 'Not Found');
    err.status = 404;
    next(err);
});


if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        log.error("Something went wrong:", err);
        res.status(err.status || 500);
        res.render('error.html', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    log.error("Something went wrong:", err);
    res.status(err.status || 500);
    res.render('error.html', {
        message: err.message,
        error: {}
    });
});


process.on('exit', function () {
    console.log("shutting down");
});

module.exports = app;
