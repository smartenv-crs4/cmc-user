var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local').Strategy;

var config = require('./config').generalConf;

var routes = require('./routes/index');
var users = require('./routes/users');
var User = require('./models/users').User;




var app = express();
var conf = null;

if (app.get('env') === 'dev') {
    conf = config.dev;
}
else{
    conf = config.production;
}
//require('./models/db')
//connect to DB
///...


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('jwtTokenSecret', 'YOUR_SECRET_STRING');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

// for timestamps in logger

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/doc', express.static('doc',{root:'doc'}));

//app.use(logger('[:mydate] :method :url :status :res[content-length] - :remote-addr - :response-time ms'));

app.use('/', routes);
app.use('/users',users); //users and cars
//app.use('/auth', auth); // authorization routes

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'dev') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
