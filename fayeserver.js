var faye = require('faye');
    http = require('http');

var server = http.createServer(),
    bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});


bayeux.attach(server);
server.listen(8000);

//unique name-handler
var client = new faye.Client('http://localhost:8000/faye');
var usernames = [];
client.subscribe('/server', function(request){
    var requestObj = JSON.parse(request);
    if(typeof requestObj.requestType !== 'undefined'){
        console.log(requestObj.requestType + ' Request: ' + requestObj.name);
        var index = usernames.indexOf(requestObj.name);
        switch(requestObj.requestType)
        {
            case 'RegName':

                var result = {responseType: 'SrvNameCheck', name: requestObj.name};
                client.publish('/server', JSON.stringify(result));

                if(index > -1){
                    var result = {responseType: 'RegNameResult', name: requestObj.name, result: 0};
                    console.log(result);
                    client.publish('/server', JSON.stringify(result));
                }else{
                    var result = {responseType: 'RegNameResult', name: requestObj.name, result: 1};
                    usernames.push(requestObj.name);
                    console.log(result);
                    client.publish('/server', JSON.stringify(result));
                }

                break;
            case 'RelName':
                if (index > -1) {
                    usernames = usernames.splice(index, 1);
                    var result = {responseType: 'RelNameResult', name: requestObj.name, result: 1};
                    console.log(result);
                    client.publish('/server', JSON.stringify(result));
                }else{
                    var result = {responseType: 'RelNameResult', name: requestObj.name, result: 0};
                    console.log(result);
                    client.publish('/server', JSON.stringify(result));
                }
                break;
            default :
                console.log('Someone is not supposed to be here!');
                break;
        }
    }

});

