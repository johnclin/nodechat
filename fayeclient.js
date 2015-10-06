var faye = require('faye');
var client = new faye.Client('http://localhost:8000/faye');
console.log('Welcome to Chat');
console.log('Please enter your name:');
var username = null;

client.subscribe('/message', function(message){
	console.log(message);
});

var util = require("util");

var stdin = process.openStdin();

stdin.addListener("data", function(msg) {
	if (username == null){
		username = msg;
		console.log('Now chatting as ' + msg);
	}else{
		var publication = client.publish('/message', msg.toString().trim());
		publication.then(function() {
	  		console.log('Message received by server!');
		}, function(error) {
			console.log('There was a problem: ' + error.message);
		});
	}
});

