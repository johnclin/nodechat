var faye = require('faye');
var inputParser = require('./inputParser');
var client = new faye.Client('http://ec2-52-24-72-40.us-west-2.compute.amazonaws.com:8000/faye');
console.log('Welcome to Chat');
inputParser.chatApp.initParser(client);
inputParser.chatApp.listen();
