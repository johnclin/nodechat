var http = require('http');
var faye = require('faye');
require('./jquery_1.11.3_min');
require('./faye/browser/faye-browser');
var html = 
'<html>' + "\n" +
'<h1>ChatServer</h1>' + "\n" +
'<script type="text/javascript">' + "\n" +
'	$( document ).ready(function() {' + "\n" +
'       var client = new Faye.Client("/faye");' + "\n" +
'       client.subscribe("/channel", function(message) {' + "\n" +
'               $("#chat").val($("#chat").val() + message);' + "\n" +
'       });' + "\n" +
'       $("#send").click(function(){' + "\n" +
'               client.publish("/channel", {text: $("#message").val()});' + "\n" +
'       });' + "\n" +
'	});' + "\n" +
'</script>' + "\n" +
'<form id="chat">' + "\n" +
'UserName: <input type="text" id="username" name="username"><br>' + "\n" +
'ChatBox: <textarea id="chat"> </textarea><br>' + "\n" +
'Message: <input type="text" id="message" name="message"><br>' + "\n" +
'<input type="button" id="send" value="Send">' + "\n" +
'</form>' + "\n" +
'</html>';

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
}).listen(80);
console.log('Server running at http://127.0.0.1:8124/');

