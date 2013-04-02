var apns = require('apn');
var app = require('./app');
var models = require('./models');
var apnsConnection;

require('fs').readFile(__dirname+'/certificate.key', 'utf8', function(err, key) {
	if (err) throw err;
	key = key.replace('\n', '');
	
	var options = {
	    cert: 'cert.pem',
	    key:  'key.pem',
	    passphrase: key,
	    gateway: 'gateway.sandbox.push.apple.com',
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
	apnsConnection = new apns.Connection(options);

	apnsConnection.on('error', function(err) {
		console.log("Error");
		console.log(err);
	});
	apnsConnection.on('transmitted', function() {
		console.log("Transmitted")
	});
	apnsConnection.on('connected', function() {
		console.log("connected")
	});
	apnsConnection.on('disconnected', function() {
		console.log("disconnected")
	});
	apnsConnection.on('transmissionError', function() {
		console.log("transmission error")
	});
})


exports.send = function (note) {
	apnsConnection.sendNotification (note);
}


var pushNotification = function(notf) {
	var notfDate = new Date(notf.deliveryTime * 1000);
	var nowDate = new Date(Date.now());
	console.log("Delivered %s was due %d:%d:%d now %d:%d:%d", notf.title, notfDate.getHours(), notfDate.getMinutes(), notfDate.getSeconds(), nowDate.getHours(), nowDate.getMinutes(), nowDate.getSeconds());
	
	// get device
	models.Device.findOne({ _id: notf.deviceID }, function(err, device) {
		if (err) throw err;
		if (device == null) {
			console.log ("Device null");
			return;
		}
		
		// Due
		var note = new apns.Notification();
	
		note.expiry = timeSeconds() + 3600; // Expires 1 hour from now.
		note.badge = 1;
		note.sound = "ping.aiff";
		note.alert = notf.title;
		note.payload = {'hello': 'world'};
		note.device = new apns.Device(device.token);
	
		exports.send(note);
	});
};

var pullNotifications = function() {
	var start = Date.now();
	var end = start+30000;
	models.Notification.find({ delivered: false }, function(err,notifications) {
		if (err) throw err;
		
		for (var i = 0; i < notifications.length; i++) {
			var notification = notifications[i];
			
			var deliveryTime = notification.deliveryTime * 1000;
			if (start > deliveryTime || deliveryTime < end) {
				notification.delivered = true;
				notification.save(function(err) {
					if (err) throw err;
				});
				
				var diff = Date.now() - deliveryTime;
				if (diff <= 0) {
					pushNotification(notification);
				} else {
					// Because of async issues, the object needs to be cloned. Otherwise the title wouldn't be the same when the timeout occurs and the notification is sent off.
					// Future do this with Futuresjs-sequence.
					var notf = {
						title: notification.title,
						deliveryTime: notification.deliveryTime,
						delivered: true,
						deviceID: notification.deviceID
					};
					setTimeout(function() {
						pushNotification(notf);
					}, diff);
				}
			}
		}
	});
}
exports.pullNotifications = pullNotifications;

//var interval = setInterval(handleNotifications, 10000); // 10 sec tick
var pullInterval = setInterval(pullNotifications, 30000);