/**
 * Created by John Lin on 10/6/2015.
 */

var inputParser = {
    states: {
        username: 0,
        channel: 1,
        inchat: 2
    },
    username: null,
    channel: null,
    state: null,
    client: null,

    initParser: function(client){
        this.util = require("util");
        this.stdin = process.openStdin();
        this.username = this.states.username;
        this.client = client;

        console.log('Please enter your name:');
    },

    listen: function(){
        this.stdin.addListener("data", function(msg) {
            var msgString = msg.toString().trim();
            switch(state){
                case this.states.username:
                    this.username = msgString;
                    console.log('Now chatting as ' + msgString);
                    break;
                case this.states.channel:
                    if(this.channel != null){
                        client.unsubscribe(this.channel);
                    }
                    this.channel = '/' + msgString;
                    this.client.subscribe(this.channel, function(message){
                        this.username;
                        console.log(message);
                    });
                    break;
                case this.states.inchat:
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
