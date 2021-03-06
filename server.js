/*

Questions for weekly chat:

1. Does socket.io already keep track of connected clients?  Do I have maintain
 my own list like I did here?

2. Is there a way to register a nickname directly to a socket so I don't have
  to keep passing it to server?

3. The keydown and keyup events that I am using to implement the {user} is typing
  functionality seems sporadic.  Is there a better way?  I have seen some chat
  software that shows {user} and {user} are typing.  What I have here would not
  accomplish this same functionality.

 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// keep track of connected clients and their nickNames
// I feel like the server should already have this list
// this is a question for Agustin.
var clients = [];

// function to get list of connected users
// If the server has its own list, change
// this to use server's list
function getConnectedUsers() {
  var users = '';
  for (var index in clients) {
    if (clients.hasOwnProperty(index)) {
      users += ' [' + clients[index] + '] ';
    }
  }
  return users;
}

function getIDByNickName(nickName) {
  var id = undefined;
  for (var index in clients) {
    if (clients.hasOwnProperty(index)) {
      if (clients[index] == nickName) {
        id = index;
        break;
      }
    }
  }
  return id;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  // Here, we add the client to our
  // list of clients with associated nickname.
  // If the server has it own list, we can use
  // that list instead.  However, there would
  // have to be a way to associate the supplied
  // nickname with each client.
  socket.on('addUser', function(nickName) {
    // register Client
   clients[socket.id] = nickName;

    // return message and client list
    var msg = nickName + ' has connected.';
    var users = getConnectedUsers();
    io.emit('usersChanged', msg, users);

  });

  // when a client disconnects, remove from
  // list and send to all clients
  socket.on('disconnect', function(){
    var msg = clients[socket.id] + ' has disconnected';
    delete clients[socket.id];
    var users = getConnectedUsers();

    io.emit('usersChanged', msg, users);

  });

  // a chat message coming from a client.  broadcast
  // from socket so it is not sent back to the sender
  socket.on('chat message', function(msg, nickName) {
    socket.broadcast.emit('chat message', nickName + ': ' + msg);
  });

  // Add this in order for one client to send a private
  // message to another client
  socket.on('privateChat', function(msg, fromNickName, toNickName) {
    // get id from nickName
    var id = getIDByNickName(toNickName);
    if (id !== undefined) {
      msg = fromNickName + ': ' + msg;
      socket.broadcast.to(id).emit('chat message', msg);
    }
  });

  // using keydown and keyup events to try to implement
  // the {user} is typing functionality.  It works OK,
  // but I feel like there is a better way.
  socket.on('keydown', function(nickName) {
    socket.broadcast.emit('keydown', nickName);
  });

  socket.on('keyup', function(nickName) {
    socket.broadcast.emit('keyup', nickName);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});