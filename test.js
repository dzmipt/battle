var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use('/www', express.static(__dirname + '/www'));

app.get('/test', () =>{
	console.log("sockets: " + io.sockets);
	io.sockets.clients((error,clients)=>{
		console.log(clients.length);
	});
});

io.on('connection',(socket) => {
	socket.on('name', (msg) => {
		console.log("socket " + socket.id + " get new name: " + msg);

		socket.broadcast.emit("new name", socket.id, msg);
	});

	socket.on('disconnect', function() {
		console.log('disconnect socket with id ' + socket.id);
		socket.broadcast.emit("disconnect id", socket.id);
	})
})



http.listen(3000, function(){
  console.log('listening on *:3000');
});