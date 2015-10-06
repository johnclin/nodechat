/**
 * Created by John Lin on 10/6/2015.
 */

var inputParser = {
    statesEnum: null,
    username: null,
    channel: null,
    state: null,
    client: null,

    initParser: function(client){
        var statesEnum = {
            USERNAME: 0,
            CHANNEL: 1,
            INCHAT: 2
        };

        this.statesEnum = statesEnum;
        this.util = require("util");
        this.stdin = process.openStdin();
        this.username = this.statesEnum.USERNAME;
        this.client = client;
        
        console.log('Please enter your name:');
    },

    listen: function(){
        this.stdin.addListener("data", function(msg) {
            var msgString = msg.toString().trim();

            switch(this.state){
                case this.statesEnum.USERNAME:
                    this.username = msgString;
                    console.log('Now chatting as ' + msgString);
                    break;
                case this.statesEnum.CHANNEL:
                    if(this.channel != null){
                        client.unsubscribe(this.channel);
                    }
                    this.channel = '/' + msgString;
                    this.client.subscribe(this.channel, function(message){
                        this.username;
                        console.log(message);
                    });
                    break;
                case this.statesEnum.INCHAT:
                    //scan for commands
                    //if no commands chat
                    var publication = this.client.publish(this.channel, msg.toString().trim());
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
