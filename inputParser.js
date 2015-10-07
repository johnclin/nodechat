/**
 * Created by John Lin on 10/6/2015.
 */
var inputParser = inputParser || {};

inputParser.statesEnum = {
    USERNAME: 0,
    NOCHANNEL: 1,
    INCHAT: 2
};

inputParser.userInfo = {
    username: null,
    channel: null,
    state: null,
    lastInput: null
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
        inputParser.connectionInfo.client.subscribe('/server', function(response){
            var responseObj = JSON.parse(response);

            switch(responseObj.responseType){
                case 'RegNameResult':
                    if(responseObj.name == inputParser.userInfo.lastInput){
                        if(responseObj.result == 1){
                            inputParser.userInfo.username = inputParser.userInfo.lastInput;
                            console.log('Now chatting as ' + inputParser.userInfo.lastInput);
                            inputParser.userInfo.state = inputParser.statesEnum.NOCHANNEL;
                            console.log('You may join into a channel by typing: /join ChannelName');
                        }else{
                            console.log('Username already in use, please enter another name:');
                        }
                    }
                    break;
                case 'RelNameResult':
                    if(responseObj.name == inputParser.userInfo.username){
                        if(responseObj.result == 1){
                            console.log('Username '+ inputParser.userInfo.username +' has been released');

                            //try to register new username
                            var usernameReq = {requestType: 'RegName', name: inputParser.userInfo.lastInput};
                            var publication = inputParser.connectionInfo.client.publish('/server', JSON.stringify(usernameReq));

                            publication.then(function(error) {
                                console.log('There was a problem: ' + error.message);
                            });

                        }else{
                            console.log('Could not release' + inputParser.userInfo);
                        }
                    }
            }

        });
    },

    listen: function(){
        inputParser.connectionInfo.stdin.addListener("data", function(userInput) {
            inputParser.userInfo.lastInput = userInput.toString().trim();
            var inputStr = inputParser.userInfo.lastInput;

            if( /[^a-zA-Z0-9]/.test( inputStr ) ) {
                var isAlphaNum = false;
            }else{
                var isAlphaNum = true;
            }


            switch(inputParser.userInfo.state){
                case inputParser.statesEnum.USERNAME:
                    if(!isAlphaNum) {
                        console.log('Usernames must be AlphaNumeric, please try again:');
                    }else{
                        var usernameReq = {requestType: 'RegName', name: inputStr};
                        var publication = inputParser.connectionInfo.client.publish('/server', JSON.stringify(usernameReq));

                        publication.then(function(error) {
                            console.log('There was a problem: ' + error.message);
                        });
                    }

                    break;
                case inputParser.statesEnum.NOCHANNEL:
                    if(!isAlphaNum) {
                        console.log('Channels must be AlphaNumeric, please try again:');
                    }else if(inputStr.toLowerCase() == 'server'){
                        console.log('You may not access channel /server');
                    }else{

                        if(inputParser.userInfo.channel != null){
                            console.log('Leaving ' + inputParser.userInfo.channel);
                            inputParser.connectionInfoclient.unsubscribe(inputParser.userInfo.channel);
                        }
                        inputParser.userInfo.channel = '/' + inputStr;
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
                    if(inputStr.charAt(0) == '/') {
                        var command = inputStr.split(' ');
                        if( /[^a-zA-Z0-9]/.test( command[1] ) ) {
                            var commandIsAlphaNum = false;
                        }else{
                            var commandIsAlphaNum = true;
                        }

                        switch (command[0]){
                            case '/status':

                                break;
                            case '/join':
                                if(!commandIsAlphaNum) {
                                    console.log('Channels must be AlphaNumeric, please try again:');
                                }else if(command[1].toLowerCase() == 'server'){
                                    console.log('You may not access channel /server');
                                }else{

                                    if(inputParser.userInfo.channel != null){
                                        console.log('Leaving ' + inputParser.userInfo.channel);
                                        inputParser.connectionInfoclient.unsubscribe(inputParser.userInfo.channel);
                                    }
                                    inputParser.userInfo.channel = '/' + command[1];
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
                            case '/name':
                                //check that name is good
                                if(!commandIsAlphaNum) {
                                    console.log('Usernames must be AlphaNumeric, please try again:');
                                }else{
                                    inputParser.userInfo.lastInput = command[1];
                                    //release name
                                    var usernameRel = {requestType: 'RelName', name: inputParser.userInfo.username};
                                    var publication = inputParser.connectionInfo.client.publish('/server', JSON.stringify(usernameRel));


                                    publication.then(function(error) {
                                        console.log('There was a problem: ' + error.message);
                                    });
                                }
                                break;
                            case '/quit':
                                throw 'quit';
                                break;
                            default :
                                console.log(command[0] + " is not a valid command");
                        }


                    }else{
                        //if no commands chat
                        var msgObj = {};
                        msgObj.text = inputStr;
                        msgObj.user = inputParser.userInfo.username;
                        var jsonObj = JSON.stringify(msgObj);
                        var publication = inputParser.connectionInfo.client.publish(inputParser.userInfo.channel, jsonObj);

                        publication.then(function(error) {
                            console.log('There was a problem: ' + error.message);
                        });
                    }

                    break;
            }
        });
    }
};

module.exports = inputParser;
