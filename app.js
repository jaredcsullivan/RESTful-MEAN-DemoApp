var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var methodOverride = require('method-override'); 
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var morgan = require('morgan'); 		
var flash = require('express-flash');


mongoose.connect('mongodb://localhost/DemoCode');

require('./models/Users');
require('./models/Items');
require('./models/Subitems');


require('./config/passport');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// TODO: place favicon in /public, uncomment below
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ 
	secret: 'session secret key',
	resave: false,
	saveUninitialized: true,
}));
app.use(passport.initialize());         
app.use(passport.session());
app.use(flash());

app.use('/', routes);
app.use('/', users);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

console.log("App listening on port 80" );
module.exports = app;