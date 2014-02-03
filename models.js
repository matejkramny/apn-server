var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var device = Schema({
	token: String,
	notifications: Number,
	lite: Boolean,
	sandbox: Boolean,
	expired: { type:Boolean, default: false }
})

var notification = Schema({
	created: { type: Date, default: Date.now() },
	title: String,
	deliveryTime: Number,
	delivered: Boolean,
	deviceID: ObjectId,
	sandbox: { default: false, type: Boolean },
	lite: { type: Boolean, required: true }
});

exports.Device = mongoose.model('Device', device);
exports.Notification = mongoose.model('Notification', notification);