var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var device = Schema({
	token: String,
	notifications: Number
})

var notification = Schema({
	title: String,
	deliveryTime: Number,
	delivered: Boolean,
	deviceID: ObjectId,
	sandbox: { default: false, type: Boolean }
});

exports.Device = mongoose.model('Device', device);
exports.Notification = mongoose.model('Notification', notification);