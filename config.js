var config = {
	"certKey": __dirname+"/certificate.key",
	"dbKey": __dirname+"/db.url",
	"sandbox": process.env.SANDBOX || false,
	"production": process.env.NODE_ENV == "production"
};

if (config.sandbox == false) {
	config.cert = __dirname+"/prodCert.pem";
	config.key = __dirname+"/prodKey.pem";
	config.gateway = "gateway.push.apple.com";
} else {
	config.cert = __dirname+"/prodCert.pem";
	config.key = __dirname+"/prodKey.pem";
	config.gateway = "gateway.sandbox.push.apple.com";
}

console.log ("Is production: %s sandbox: %s", config.production, config.sandbox);

module.exports = config;