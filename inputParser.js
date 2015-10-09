/**
 * Created by John Lin on 10/6/2015.
 */
var inputParser = inputParser || {};

inputParser.statesEnum = {
    USERNAME: 0,
    INCHAT: 1
};

inputParser.userInfo = {
    username: null,
    channel: null,
    state: null,
    lastInput: null
};

inputParser.connectionInfo = {
    client: null,
    rl: require('readline').createInterface(
        process.stdin, process.stdout
    ),
};

inputParser.chatApp = {
    username: null,
    channel: null,
    state: null,
    client: null,

    initParser: function(client){
        inputParser.userInfo.state = inputParser.statesEnum.USERNAME;
        inputParser.connectionInfo.client = client;
        inputParser.chatApp.initNameServer();
        inputParser.chatApp.initUsername();
    },

    initNameServer: function(){
        inputParser.connectionInfo.client.subscribe('/server', function(response){
            var responseObj = JSON.parse(response);

            switch(responseObj.responseType){
                case 'RegNameResult':
                    if(responseObj.name == inputParser.userInfo.lastInput){
                        if(responseObj.result == 1){
                            inputParser.userInfo.username = inputParser.userInfo.lastInput;
                            console.log('Now chatting as ' + inputParser.userInfo.lastInput);
                            inputParser.userInfo.state = inputParser.statesEnum.INCHAT;
                            if(inputParser.userInfo.channel == null){
                                console.log('You may join into a channel by typing: /join ChannelName');
                                inputParser.chatApp.listen();
                            }
                        }else{
                            console.log('Username already in use, please enter another name:');
                            inputParser.chatApp.initUsername();
                        }
                    }
                    break;
                case 'RelNameResult':
                    if(responseObj.name == inputParser.userInfo.username){
                        if(responseObj.result == 1){
                            console.log('Username '+ inputParser.userInfo.username +' has been released');

                            if(inputParser.userInfo.lastInput == '/quit'){
                                throw 'exiting';
                            }
                            //try to register new username
                            var usernameReq = {requestType: 'RegName', name: inputParser.userInfo.lastInput};
                            inputParser.chatApp.publish('/server', JSON.stringify(usernameReq));
                        }else{
                            console.log('Could not release ' + inputParser.userInfo);
                        }
                    }
            }
        });
    },

    testAlphaNumNoSpace: function(input){
        if(/^[a-zA-Z0-9-_]+$/.test(input)) {
            return true;
        }else{
            return false;
        }
    },

    publish: function(server, msgStr){
        var publication = inputParser.connectionInfo.client.publish(server, msgStr);
        publication.then(function() {
                return true;
            }, function(error) {
                console.log('There was a problem: ' + error.message);
            });
    },

    initUsername: function() {
        inputParser.connectionInfo.rl.setPrompt('Enter username: ');
        inputParser.connectionInfo.rl.prompt(true);

        inputParser.connectionInfo.rl.on('line', function(line) {
            if(!inputParser.chatApp.testAlphaNumNoSpace(line)) {
                console.log('Usernames must be AlphaNumeric and without spaces, please try again:');
                inputParser.chatApp.initUsername();
            }else{
                inputParser.userInfo.lastInput = line;
                var usernameReq = {requestType: 'RegName', name: line};
                inputParser.chatApp.publish('/server', JSON.stringify(usernameReq));
                inputParser.connectionInfo.rl.removeAllListeners();
            }
        });
    },

    listen: function(){
        inputParser.connectionInfo.rl.setPrompt(inputParser.userInfo.username + ": ");
        inputParser.connectionInfo.rl.prompt(true);
        inputParser.connectionInfo.rl.on('line', function(userInput) {
            inputParser.userInfo.lastInput = userInput.toString().trim();
            var inputStr = inputParser.userInfo.lastInput;
            //scan for commands
            if (inputStr.charAt(0) == '/') {
                var command = inputStr.split(' ');

                switch (command[0]) {
                    case '/status':
                        console.log("Username: " + inputParser.userInfo.username);
                        console.log("Channel: " + inputParser.userInfo.channel);
                        break;
                    case '/join':
                        if (!inputParser.chatApp.testAlphaNumNoSpace(command[1])) {
                            console.log('Channels must be AlphaNumeric and without spaces, please try again:');
                        } else if (command[1].toLowerCase() == 'server') {
                            console.log('You may not access channel /server');
                        } else if (command[1] == '') {
                            if (inputParser.userInfo.channel == null) {
                                console.log('You are not in a channel.');
                                console.log('type: /join "ChannelName"');
                            } else {
                                console.log('You are currently in channel: ' + inputParser.userInfo.channel);
                            }
                        } else {

                            if (inputParser.userInfo.channel != null) {
                                console.log('Leaving ' + inputParser.userInfo.channel);
                                inputParser.connectionInfo.client.unsubscribe(inputParser.userInfo.channel);
                            }
                            inputParser.userInfo.channel = '/' + command[1];
                            console.log('Entering ' + inputParser.userInfo.channel);
                            inputParser.connectionInfo.client.subscribe(inputParser.userInfo.channel, function (message) {
                                var msgObj = JSON.parse(message);
                                if (msgObj.name != inputParser.userInfo.username) {
                                    process.stdout.write('\x1B[2K');    //clear line
                                    process.stdout.write('\x1B[1E');    //cursor to beginning of line
                                    console.log(msgObj.name + ': ' + msgObj.chattext);
                                    process.stdout.write('\x1B[6n');    //report
                                    inputParser.connectionInfo.rl.prompt(true);
                                }
                            });
                            inputParser.userInfo.state = inputParser.statesEnum.INCHAT;
                        }
                        break;
                    case '/name':
                        //check that name is good
                        if (!inputParser.chatApp.testAlphaNumNoSpace(command[1])) {
                            console.log('Usernames must be AlphaNumeric and without spaces, please try again:');
                        } else if (command[1] == '') {
                            console.log('Your username is: ' + inputStr.userInfo.username);
                        } else {
                            inputParser.userInfo.lastInput = command[1];
                            //release name
                            var usernameRel = {requestType: 'RelName', name: inputParser.userInfo.username};
                            inputParser.chatApp.publish('/server', JSON.stringify(usernameRel));
                        }
                        break;
                    case '/quit':
                        var usernameRel = {requestType: 'RelName', name: inputParser.userInfo.username};
                        inputParser.chatApp.publish('/server', JSON.stringify(usernameRel));
                        break;
                    default :
                        console.log(command[0] + " is not a valid command");
                        console.log("Here is a list of valid commands: /join /name /status /quit");
                }
            }else{
                //if no commands chat
                var msgObj = {chattext: inputStr, name: inputParser.userInfo.username};
                inputParser.chatApp.publish(inputParser.userInfo.channel, JSON.stringify(msgObj));
            }
            inputParser.connectionInfo.rl.prompt(true);
        });
    }
};

module.exports = inputParser;
