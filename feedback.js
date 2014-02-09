var config = require('./config');
var apn = require('apn');
var async = require('async');
var models = require('./models')

var handleFeedback = function(devices) {
	async.map(devices, function(device, cb) {
		cb(null, device.device)
	}, function(err, sortedDevices) {
		if (err) throw err;
		
		models.Device.update({
			token: {
				$in: sortedDevices
			}
		}, {
			$set: {
				expired: true
			}
		}, {
			multi: true
		})
	})
}

var lite = new apn.Feedback({
	cert: config.lite.prod.cert,
	key: config.lite.prod.key,
	passphrase: 'trav',
	address: 'feedback.push.apple.com',
	port: 2196,
	feedback: handleFeedback,
	batchFeedback: true,
	interval: 86400
});
var full = new apn.Feedback({
	cert: config.full.prod.cert,
	key: config.full.prod.key,
	passphrase: 'trav',
	address: 'feedback.push.apple.com',
	port: 2196,
	feedback: handleFeedback,
	batchFeedback: true,
	interval: 86400
})