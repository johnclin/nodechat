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

            if( /[^a-zA-Z0-9]/.test( msgString ) ) {
                var isAlphaNum = false;
            }else{
                var isAlphaNum = true;
            }

            switch(inputParser.userInfo.state){
                case inputParser.statesEnum.USERNAME:
                    if(isAlphaNum) {
                        inputParser.userInfo.username = msgString;
                        console.log('Now chatting as ' + msgString);
                        inputParser.userInfo.state = inputParser.statesEnum.CHANNEL;
                    }else{
                        console.log('Usernames must be AlphaNumeric, please try again:');
                    }

                    break;
                case inputParser.statesEnum.CHANNEL:
                    if(isAlphaNum) {
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
                    }else{
                        console.log('Channels must be AlphaNumeric, please try again:');
                    }

                    break;
                case inputParser.statesEnum.INCHAT:
                    //scan for commands
                    //if no commands chat
                    var publication = inputParser.connectionInfo.client.publish(inputParser.userInfo.channel, msg.toString().trim());

                    publication.then(function(error) {
                        console.log('There was a problem: ' + error.message);
                    });

                    break;
            }
        });
    }
};

module.exports = inputParser;
