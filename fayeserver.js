var faye = require('faye');
    http = require('http');

var server = http.createServer(),
    bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});


bayeux.attach(server);
server.listen(8000);

//unique name-handler
var client = new faye.Client('http://localhost:8000/faye');
var usernames = [];
client.subscribe('/admin', function(request){
    var requestObj = JSON.parse(request);
    var index = usernames.indexOf(requestObj.name);

    switch(requestObj.requestType)
    {
        case 'RegName':
            if(index > -1){
                var result = {responseType: 'RegNameResult', name: requestObj.name, result: 0};
                client.publish('/admin', JSON.stringify(result));
            }else{
                var result = {responseType: 'RegNameResult', name: requestObj.name, result: 1};
                usernames.push(requestObj.name);
                client.publish('/admin', JSON.stringify(result));
            }

            break;
        case 'RelName':
            if (index > -1) {
                usernames = usernames.splice(index, 1);
                var result = {responseType: 'RelNameResult', name: requestObj.name, result: 1};
                client.publish('/admin', JSON.stringify(result));
            }else{
                var result = {responseType: 'RelNameResult', name: requestObj.name, result: 0};
                client.publish('/admin', JSON.stringify(result));
            }
            break;
        default :
            //do nothing
            break;
    }

});