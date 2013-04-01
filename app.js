
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , apn = require('./apn')
  , apns = require('apn')
  , mongoose = require('mongoose')
  , models = require('./models')
  , cli = require('./cli');

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

app.get('/', routes.index);
app.post('/register', routes.register);
app.post('/schedule', routes.schedule);

require('fs').readFile(__dirname+"/db.url", 'utf8', function (err, data) {
	if (err) throw err;
	data = data.replace("\n", "");
	
	mongoose.connect(data);
	
	models.Notification.find({ delivered: false }, function(err,notifications) {
		if (err) throw err;
	
		if (notifications != null) {
			console.log("I haz %d notifications to process", notifications.length);
			var date = timeSeconds();
			for (var i in notifications) {
				var notification = notifications[i];
			
				var deliveryDate = new Date(notification.deliveryTime*1000);
				console.log("Notif. named %s, delivery at %d:%d:%d", notification.title, deliveryDate.getHours(), deliveryDate.getMinutes(), deliveryDate.getSeconds());
			
				apn.notfs.push(notification);
			}
		} else {
			console.log("No unsent notf.");
		}
	});

	http.createServer(app).listen(app.get('port'), function(){
	  console.log("Express server listening on port " + app.get('port'));
	});
});
