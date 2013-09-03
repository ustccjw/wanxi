
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ejs = require('ejs') ;

var app = express();

/*------------------adding--------------*/
var MongoStore = require('connect-mongo')(express) ;
var settings = require('./settings') ;
var routes =require('./routes') ;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

/*-------------adding------------*/
app.use(express.cookieParser()) ;
app.use(express.session({
	secret: settings.cookieSecret,
	store: new MongoStore({
		db: settings.db
	})
})) ;
app.use(function(req, res, next){
	res.locals.message = '' ;
	if(req.session.error){
		res.locals.message = 'alert("' + req.session.error + '")' ;
		delete req.session.error ;
	}
	else if(req.session.success){
		res.locals.message = 'alert("' + req.session.success + '")' ;
		delete req.session.success ;
	}
	next() ;
});



app.use(routes(app));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/users', user.list) ;

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
