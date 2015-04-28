
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// keep track of connected clients and their nickNames
// I assume that the
var clients = [];

// function to get list of connected users
function getConnectedUsers() {
  var users = '';
  for (var index in clients) {
    if (clients.hasOwnProperty(index)) {
      users += ' [' + clients[index] + '] ';
    }
  }
  return users;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  //
  socket.on('addUser', function(nickName) {
    // register Client
    clients[socket.id] = nickName;

    // return message and client list
    var msg = nickName + ' has connected.';
    var users = getConnectedUsers();
    io.emit('usersChanged', msg, users);

  });

  //
  socket.on('disconnect', function(){
    var msg = clients[socket.id] + ' has disconnected';
    delete clients[socket.id];
    var users = getConnectedUsers();

    io.emit('usersChanged', msg, users);

  });

  socket.on('chat message', function(msg, nickName) {
    socket.broadcast.emit('chat message', nickName + ': ' + msg);
  });

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