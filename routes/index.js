var models = require('../models');
var app = require('../app')
var apn = require('../apn')
var config = require('../config');

exports.register = function(req,res) {
	console.log("Requesting");
	var token = req.body.token;
	token = token.replace(" ", "");
	
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
			if (device.expired) {
				// Not expired anymore
				device.expired = false;
				device.save();
			}
		} else {
			device = new models.Device({
				token: token,
				notifications: 0,
				sandbox: req.body.debug == "true" ? true : false,
				lite: req.body.full == "true" ? false : true
			});
			device.save(function(err) {
				if (err) throw err;
				console.log("New device saved");
			});
		}
		
		res.send("200");
	});
};

exports.schedule = function(req,res) {
	var token = req.body.token;
	var time = req.body.deliveryTime;
	var title = req.body.title;
	models.Device.findOne({ token: token, expired: false }, function (err, device) {
		if (err) throw err;
		if (device != null) {
			// Schedule a notf.
			var notf = new models.Notification({
				title: title,
				deliveryTime: time,
				delivered: false,
				deviceID: device._id,
				sandbox: req.body.debug == "true" ? true : false,
				lite: req.body.full == "true" ? false : true
			});
			
			notf.save(function(err) {
				if (err) throw err;
			});
			
			var date = new Date(time*1000);
			
			res.send("200");
		} else {
			// Nil device id
			res.send("400 Invalid Token");
		}
	});
};