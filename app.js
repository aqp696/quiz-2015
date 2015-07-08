var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var partials        = require('express-partials');
var methodOverride  = require('method-override');
var session         = require('express-session');

var routes = require('./routes/index');


var app = express();
var session_expires = false;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));



// MW with expire session in 2 minutes
app.use(function(req, res, next) {
    var now = new Date();
    var stamp = req.session.time ? new Date(req.session.time):new Date();
    console.log('STAMP: ' + stamp.getHours() + ':' + stamp.getMinutes() + ':' + stamp.getSeconds() );
    console.log('NOW: ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() );
    
    // Si se trata de un usuario logueado a cualquier ruta salvo /login y /logout
    if(!req.path.match(/\/login|\/logout/) && req.session.user) {
        var elapsed = Math.floor(now.getTime()/1000 - stamp.getTime()/1000);
         console.log('Tiempo transcurrido: ' + elapsed);
        
        // Expira a los 2 minutos (120 segundos)
        if (elapsed > 120) {
            // Tiempo expira
            console.log('Sesión caducada');
            req.session.errors = [{"message": 'Sesión caducada'}];
            req.session.time = now;
            session_expires = true;
            exports.session_expires = session_expires;
            res.redirect('/logout');
        } else {
            // Renovamos tiempo expiración
            console.log('Renovamos sesión');

            req.session.time = now;
            next();
        }
    } else {
        next();
    }
});

// Helpers dinamicos
app.use(function(req, res, next){
    
    // guardar path en session.redir para despues de login
    if (!req.path.match(/\/login|\/logout/)) {
        req.session.redir = req.path;
    }
    
    // Hacer visible req.session en las vistas
    res.locals.session = req.session;
    next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});

module.exports = app;
