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
    state: states.username,

    initParser: function(){
        this.util = require("util");
        this.stdin = process.openStdin();

        this.

        console.log('Please enter your name:');
    },

    listen: function(){
        stdin.addListener("data", function(msg) {
            var msgString = msg.toString().trim();
            switch(state){
                case states.username:
                    username = msgString;
                    console.log('Now chatting as ' + msgString);
                    break;
                case states.channel:
                    if(this.channel != null){
                        client.unsubscribe(this.channel);
                    }
                    this.channel = '/' + msgString;
                    client.subscribe(this.channel, function(message){
                        this.username;
                        console.log(message);
                    });
                    break;
                case states.inchat:
                    //scan for commands
                    //if no commands chat
                    var publication = client.publish('/message', msg.toString().trim());
                    publication.then(function() {
                        console.log('Message received by server!');
                    }, function(error) {
                        console.log('There was a problem: ' + error.message);
                    });
                    break;
            }
            if (username == null){
                username = msg;
                console.log('Now chatting as ' + msg);
            }else{
                var publication = client.publish('/message', msg.toString().trim());
                publication.then(function() {
                    console.log('Message received by server!');
                }, function(error) {
                    console.log('There was a problem: ' + error.message);
                });
            }
        });
    }
};
