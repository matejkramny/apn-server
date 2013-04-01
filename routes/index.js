var models = require('../models');
var app = require('../app')
var apn = require('../apn')

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.register = function(req,res) {
	console.log("Requesting");
	var token = req.body.token;
	token = token.replace(" ", "");
	
	console.log("Token: "+token);
	
	if (token.length != 64) {
		console.log("Invalid token");
		res.send("400 Invalid Token");
		return;
	}
	
	models.Device.findOne({ token: token }, function (err, device) {
		if (err) throw err;
		if (device != null) {
			// Exists
			// do nothing
			console.log("Duplicate..");
		} else {
			device = new models.Device({ token: token, notifications: 0 });
			device.save(function(err) {
				if (err) throw err;
				console.log("New device saved");
			});
		}
		
		res.send("200");
	});
};
exports.schedule = function(req,res) {
	console.log("Scheduling");
	var token = req.body.token;
	var time = req.body.deliveryTime;
	var title = req.body.title;
	
	models.Device.findOne({ token: token }, function (err, device) {
		if (err) throw err;
		if (device != null) {
			// Schedule a notf.
			var notf = new models.Notification({
				title: title,
				deliveryTime: time,
				delivered: false,
				deviceID: device._id
			});
			
			notf.save(function(err) {
				if (err) throw err;
				console.log("Saved new notification");
			});
			
			var date = new Date(time*1000);
			console.log("Creating new notf. Delivery at "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds());
			apn.notfs.push(notf);
		} else {
			// Nil device id
			res.send("400 Invalid Token");
		}
	});
};