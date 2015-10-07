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
        console.log('Please enter your name:');
    },

    listen: function(){
        inputParser.connectionInfo.stdin.addListener("data", function(msg) {
            var msgString = msg.toString().trim();

            if( /[^a-zA-Z0-9]/.test( msgString ) ) {
                var isAlphaNum = false;
            }else{
                var isAlphaNum = true;
            }

            switch(inputParser.userInfo.state){
                case inputParser.statesEnum.USERNAME:
                    if(!isAlphaNum) {
                        console.log('Usernames must be AlphaNumeric, please try again:');
                    }else{
                        inputParser.userInfo.username = msgString;
                        console.log('Now chatting as ' + msgString);
                        inputParser.userInfo.state = inputParser.statesEnum.CHANNEL;
                        console.log('Please select Channel:');
                    }

                    break;
                case inputParser.statesEnum.CHANNEL:
                    if(!isAlphaNum) {
                        console.log('Channels must be AlphaNumeric, please try again:');
                    }else if(msgString.toLowerCase() == 'admin'){
                        console.log('You may not access channel /admin:');
                    }else{

                        if(inputParser.userInfo.channel != null){
                            console.log('Leaving ' + inputParser.userInfo.channel);
                            inputParser.connectionInfoclient.unsubscribe(inputParser.userInfo.channel);
                        }
                        inputParser.userInfo.channel = '/' + msgString;
                        console.log('Entering ' + inputParser.userInfo.channel);
                        inputParser.connectionInfo.client.subscribe(inputParser.userInfo.channel, function(message){
                            var msgObj = JSON.parse(message);
                            if (msgObj.user != inputParser.userInfo.username) {
                                console.log(msgObj.user + ': ' + msgObj.text);
                            }
                        });
                        inputParser.userInfo.state = inputParser.statesEnum.INCHAT;
                    }

                    break;
                case inputParser.statesEnum.INCHAT:
                    //scan for commands
                    //if no commands chat
                    var msgObj = {}
                        msgObj.text = msgString;
                        msgObj.user = inputParser.userInfo.username;
                    var jsonObj = JSON.stringify(msgObj);
                    var publication = inputParser.connectionInfo.client.publish(inputParser.userInfo.channel, jsonObj);

                    publication.then(function(error) {
                        console.log('There was a problem: ' + error.message);
                    });

                    break;
            }
        });
    }
};

module.exports = inputParser;
