A simple chat server.

Expectations:
Some knowledge is expected to properly set up this server and client
 - GitHub
 - npm

To set up a local instance on your server:

1. Acquire the code from GitHub:

git@github.com:johnclin/nodechat.git

node itself and all npm modules should already be installed on the committed code
though you should check to ensure that Faye and Require are both installed
To do so, navigate to the nodechat folder and run:
npm install faye
npm install require

2. Start the Faye server on node

SSH into your server.  Navigate to the nodechat folder and run fayeserver.js
node fayeserver.js

3. Run client(s)
Once the server is running clients can SSH in to log into chat.
Navigate to the nodechat folder and run fayeclient.js

4. In the client
You will first be greeted by a request to name yourself.  Must be AlphaNumeric, no spaces.
After that you may join a channel by typing /join <channelname>
The current list of commands are:
/join   join a channel.  format: "/join <channel name>"
/name   rename oneself.  format: "/name <new username>"
/status displays current username and channel
/quit   terminates the client

Sample Client:
I already have the client running on