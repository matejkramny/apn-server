var program = require('commander');
var apn = require('./apn')
var models = require('./models')

program.version('0.0.1').parse(process.argv);

var list = ["status"];

function prompt () {
	program.prompt("> ", function(does) {
		if (does == "status") {
			console.log("Requesting..");
			models.Notification.find({ delivered: false }, function(err, data) {
				if (err) throw err;
				
				console.log("Printing %d undelivered notifications", data.length);
				for (var i in apn.notfs) {
					var date = new Date(data[i].deliveryTime*1000);
					console.log("a %s -.- %d:%d:%d", data[i].title, date.getHours(), date.getMinutes(), date.getSeconds());
				}
			});
		} else if (does == "ping") {
			console.log ("pong");
		}
		
		prompt();
	});
}

prompt();