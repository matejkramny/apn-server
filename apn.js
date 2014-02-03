var apns = require('apn');
var app = require('./app');
var models = require('./models');
var config = require('./config');
var async = require('async')

var createConnection = function(conf) {
	var options = {
		cert: conf.cert,
		key: conf.key,
		gateway: conf.gateway,
		passphrase: 'trav',
		port: 2195,
		rejectUnauthorized: true,
		enhanced: true,
	    errorCallback: function(err, notification) {
	    	console.log(err);
	    },
	    cacheLength: 100,
	    autoAdjustCache: true,
	    connectionTimeout: 0
	};
	
	var connection = new apns.Connection(options);
	
	connection.on('error', function(err) {
		console.log("Error");
		console.log(err);
	});
	connection.on('transmitted', function() {
		console.log("Transmitted")
	});
	connection.on('connected', function() {
		console.log("connected")
	});
	connection.on('disconnected', function() {
		console.log("disconnected")
	});
	connection.on('transmissionError', function() {
		console.log("transmission error")
	});
	
	return connection;
}

var cns = {
	lite: {
		dev: createConnection(config.lite.sandbox),
		prod: createConnection(config.lite.prod)
	},
	full: {
		dev: createConnection(config.full.sandbox),
		prod: createConnection(config.full.prod)
	}
}

exports.send = function (note, conf) {
	var connection;
	var cn;
	
	if (conf.lite) {
		cn = cns.lite;
	} else {
		cn = cns.full;
	}
	
	if (conf.sandbox) {
		connection = cn.dev;
	} else {
		connection = cn.prod;
	}
	
	connection.sendNotification(note);
}

var pushNotification = function(notf) {
	var notfDate = new Date(notf.deliveryTime * 1000);
	var nowDate = new Date(Date.now());
	//console.log("Delivered %s was due %d:%d:%d now %d:%d:%d", notf.title, notfDate.getHours(), notfDate.getMinutes(), notfDate.getSeconds(), nowDate.getHours(), nowDate.getMinutes(), nowDate.getSeconds());
	
	// get device
	models.Device.findOne({ _id: notf.deviceID, expired: false }, function(err, device) {
		if (err) throw err;
		if (device == null) {
			console.log ("Device null");
			return;
		}
		
		// Due
		var note = new apns.Notification();
	
		note.expiry = timeSeconds() + 3600; // Expires 1 hour from now.
		note.badge = 1;
		note.sound = "default";
		note.alert = notf.title;
		note.payload = {};
		note.device = new apns.Device(device.token);
	
		exports.send(note, { lite: notf.lite, sandbox: notf.sandbox });
	});
};

var handleNotification = function(notification, start, end, cb) {
	var deliveryTime = notification.deliveryTime * 1000;
	if (start > deliveryTime || deliveryTime < end) {
		notification.delivered = true;
		notification.save(function(err) {
			if (err) throw err;
		});
		
		var diff = deliveryTime - Date.now();
		
		if (diff <= 0) {
			pushNotification(notification);
		} else {
			setTimeout(function() {
				pushNotification(notification);
			}, diff);
		}
	}
	
	cb();
}

var pullNotifications = function() {
	var start = Date.now();
	var end = start+10000;
	models.Notification.find({ delivered: false }, function(err, notifications) {
		if (err) throw err;
		
		async.each(notifications, function(notification, cb) {
			handleNotification(notification, start, end, cb);
		}, function(err) {
			if (err) console.log(err);
		});
	});
};

exports.pullNotifications = pullNotifications;

//var interval = setInterval(handleNotifications, 10000); // 10 sec tick
var pullInterval = setInterval(pullNotifications, 10000);