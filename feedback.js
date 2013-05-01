var config = require('./config');
var apn = require('apn');
var options = {
    cert: config.cert,
    key: config.key,
    passphrase: 'trav',
    address: 'feedback.push.apple.com',
    port: 2196,
	feedback: function(a) {
		console.log("I HAZ FEEDBACK");
		console.log(a);
	},
	interval: 5
};
var feedback = new apn.Feedback(options);