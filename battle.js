var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sessions = require('./sessions.js');
var game = require('./game.js');

app.use('/www', express.static(__dirname + '/www'));

app.get('/test', () => {
	console.log("sockets: " + io.sockets);
	io.sockets.clients((error,clients)=>{
		console.log(clients.length);
	});
});

io.on('connection',(socket) => {
	let session = sessions.newSession(socket);
	console.log("new session with id " + session.id);
	socket.emit('session id', session.id);
	socket.session = session;

	socket.on('name', (name) => {
		let session = socket.session;
		console.log("session " + session.id + " get name: " + name);
		session.name = name;

		socket.broadcast.emit("new name", session.id, name);
		for (i=0; i<sessions.sessions.length; i++) {
			let aSession = sessions.sessions[i];
			if (aSession.id == session.id) continue;
			if (aSession.name == undefined) continue;
			socket.emit("new name", aSession.id, aSession.name);
		}

	});

	socket.on('disconnect', () => {
		let session = socket.session;
		console.log('disconnect session id ' + session.id);
		sessions.removeSession(session.id);
		socket.broadcast.emit("disconnect id", session.id);
	});


	socket.on('invite', (bid) => {
		let aid = socket.session.id;
		console.log("invite aid=" + aid + "; bid=" + bid);
		sessions.invite(aid,bid);
		sessions.getSession(bid).socket.emit("invited by", aid);
	});

	socket.on('refuse', (bid) => {
		let aid = socket.session.id;
		console.log("refuse aid=" + aid + "; bid=" + bid);
		sessions.refuse(aid,bid);
		sessions.getSession(bid).socket.emit("refused by", aid);		
	});

	socket.on('play', (bid) => {
		let aid = socket.session.id;
		console.log("play aid=" + aid + "; bid=" + bid);
		sessions.play(aid,bid);

		let aSession = socket.session;
		let bSession = sessions.getSession(bid);
		aSession.socket.emit("play with", aid, 0);		
		bSession.socket.emit("play with", bid, 1);		

		aSession.gameId = bSession.gameId = game.initGame(aSession.socket, bSession.socket);
	});

	socket.on('initTable', (value) => {
		game.initTable(socket.session.gameId, socket.session.playIndex, value);
	});

	socket.on("move", (row,col, row1, col1) => {
		game.move(socket.session.gameId, socket.session.playIndex, row,col, row1, col1);
	});
	socket.on("attack", (row,col, row1, col1) => {
		game.attack(socket.session.gameId, socket.session.playIndex, row,col, row1, col1);
	});

})



http.listen(3000, '192.168.1.34', function(){
//http.listen(3000, '127.0.0.1', function(){
  console.log('listening on *:3000');
});