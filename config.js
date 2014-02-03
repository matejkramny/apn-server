var fs = require('fs'),
	read = fs.readFileSync;

var priv = __dirname+"/private/";

var config = {
	"production": process.env.NODE_ENV == "production"
};

config.lite = {
	prod: {
		cert: priv+'lite/prod.crt.pem',
		key: priv+'lite/prod.key.pem',
		gateway: 'gateway.push.apple.com'
	}, sandbox: {
		cert: priv+'lite/dev.crt.pem',
		key: priv+'lite/dev.key.pem',
		gateway: 'gateway.sandbox.push.apple.com'
	}
};
config.full = {
	prod: {
		cert: priv+'full/prod.crt.pem',
		key: priv+'full/prod.key.pem',
		gateway: 'gateway.push.apple.com'
	}, sandbox: {
		cert: priv+'full/dev.crt.pem',
		key: priv+'full/dev.key.pem',
		gateway: 'gateway.sandbox.push.apple.com'
	}
}

console.log ("Is production: %s", config.production);

module.exports = config;