
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = new Array();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('disconnect', function(){
    io.emit('chat message', clients[socket.id] + ' has disconnected');
    delete clients[socket.id];
  });
  socket.on('chat message', function(msg, nickName) {
    socket.broadcast.emit('chat message', nickName + ': ' + msg);
  });
  socket.on('User Connected', function(nickName) {
    // register Client
    clients[socket.id] = nickName;
    io.emit('chat message', nickName + ' has connected.');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});