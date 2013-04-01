var program = require('commander');
var apn = require('./apn')

program.version('0.0.1').parse(process.argv);

var list = ["status"];

function prompt () {
	program.prompt("> ", function(does) {
		if (does == "status") {
			console.log("Printing apn.notfs[%d]", apn.notfs.length);
			for (var i in apn.notfs) {
				var date = new Date(apn.notfs[i].deliveryTime*1000);
				console.log("a %s -.- %d:%d:%d", apn.notfs[i].title, date.getHours(), date.getMinutes(), date.getSeconds());
			}
		} else if (does == "ping") {
			console.log ("pong");
		}
		
		prompt();
	});
}

prompt();