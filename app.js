var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , apn = require('./apn')
  , apns = require('apn')
  , mongoose = require('mongoose')
  , models = require('./models')
  , config = require('./config');

timeSeconds = function() { return Math.floor(Date.now() / 1000); };
exports.timeSeconds = timeSeconds;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
	res.send("ok");
})
app.post('/register', routes.register);
app.post('/schedule', routes.schedule);

if (config.production) {
	mongoose.connect(process.env.DB_URL);
} else {
	mongoose.connect("mongodb://localhost/apn");
}

apn.pullNotifications();
require('./feedback')

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
