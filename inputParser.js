/**
 * Created by John Lin on 10/6/2015.
 */
var inputParser = inputParser || {};

inputParser.statesEnum = {
    USERNAME: 0,
    CHANNEL: 1,
    INCHAT: 2
};

inputParser.userInfo = {
    username: null,
    channel: null,
    state: null
};

inputParser.connectionInfo = {
    stdin: null,
    client: null
};

inputParser.chatApp = {
    username: null,
    channel: null,
    state: null,
    client: null,

    initParser: function(client){
        var util = require("util");
        inputParser.connectionInfo.stdin = process.openStdin();
        inputParser.userInfo.state = inputParser.statesEnum.USERNAME;
        inputParser.connectionInfo.client = client;
        switch(inputParser.userInfo.state){
            case inputParser.statesEnum.USERNAME:
                console.log('Please enter your name:');
                break;
            case inputParser.statesEnum.CHANNEL:
                console.log('Please select Channel:');
                break;
        }
    },

    listen: function(){
        inputParser.connectionInfo.stdin.addListener("data", function(msg) {
            var msgString = msg.toString().trim();
            switch(inputParser.userInfo.state){
                case inputParser.statesEnum.USERNAME:
                    inputParser.userInfo.username = msgString;
                    console.log('Now chatting as ' + msgString);
                    inputParser.userInfo.state = inputParser.statesEnum.CHANNEL;
                    break;
                case inputParser.statesEnum.CHANNEL:
                    if(inputParser.userInfo.channel != null){
                        console.log('Leaving ' + inputParser.userInfo.channel);
                        inputParser.connectionInfoclient.unsubscribe(inputParser.userInfo.channel);
                    }
                    inputParser.userInfo.channel = '/' + msgString;
                    console.log('Entering ' + inputParser.userInfo.channel);
                    inputParser.connectionInfo.client.subscribe(inputParser.userInfo.channel, function(message){
                        inputParser.userInfo.username;
                        console.log(message);
                    });
                    inputParser.userInfo.state = inputParser.statesEnum.INCHAT;
                    break;
                case inputParser.statesEnum.INCHAT:
                    //scan for commands
                    //if no commands chat
                    var publication = inputParser.connectionInfo.client.publish(inputParser.userInfo.channel, msg.toString().trim());
                    publication.then(function() {
                        console.log('Message received by server!');
                    }, function(error) {
                        console.log('There was a problem: ' + error.message);
                    });
                    break;
            }
        });
    }
};

module.exports = inputParser;
