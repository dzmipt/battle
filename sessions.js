
var sessions = [];

exports.sessions = sessions;

exports.newSession = function (socket) {
	var session = {};
	session.socket = socket;
	session.id = newSessionId();
	session.playWithId = -1;
	session.playIndex = -1;
	session.gameId = -1;
	sessions.push(session);
	return session;
}

var pairs = [];

function newSessionId() {
	var id;
	do {
		id = Math.floor(Math.random() * 1000000000);
	} while (getSession(id) != undefined );
	return id;
}

exports.getSession = getSession;

function getSession(id) {
	for (i=0; i<sessions.length; i++) {
		if (sessions[i].id == id) return sessions[i];
	}
	return undefined;
}

exports.removeSession = function (id) {
	for (i=0; i<sessions.length; i++) {
		if (sessions[i].id == id) {
			sessions.splice(i,1);
			break;
		}
	}
	exports.leave(id);
}

exports.invite = function (aid,bid) {
	for (i=0; i<pairs.length; i++) {
		if (pairs[i].a == aid && pairs[i].b == bid) return;
	}
	let p = {};
	p.a = aid;
	p.b = bid;
	pairs.push(p);
}

exports.refuse = function (aid,bid) {
	for (i=0; i<pairs.length; i++) {
		if (pairs[i].a == aid && pairs[i].b == bid) {
			pairs.splice(i,1);
			break;
		}
	}
}

exports.leave = function leave(id) {
	let newPairs = [];
	for (i=0; i<pairs.length; i++) {
		if (pairs[i].a == id || pairs[i].b == id) continue;
		newPairs.push(pairs[i]);
	}
	pairs = newPairs;
}

exports.play = function (aid,bid) {
	let aSession = getSession(aid);
	let bSession = getSession(bid);
	aSession.playWithId = bid;
	bSession.playWithId = aid;	
	aSession.playIndex = 0;
	bSession.playIndex = 1;
	exports.leave(aid);
	exports.leave(bid);
}

