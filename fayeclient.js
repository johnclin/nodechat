var faye = require('faye');
var inputParser = require('./inputParser');
var client = new faye.Client('http://localhost:8000/faye');
console.log('Welcome to Chat');
inputParser.chatApp.initParser(client);
inputParser.chatApp.listen();
