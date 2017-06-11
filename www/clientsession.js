var socket=io();
var sessionId;
var playWithId;
var name;

function sendName() {
	name = $('#inpName').val();
	socket.emit('name',name);
	console.log('name sent ' + name);

	$('#divName').css('display','none');
	$('#spanName').text(name);
	$('#divPair').css('display','block');
}

function invite() {
	let id = $(this).closest('div').attr("id");
	console.log("invite " + id);
	socket.emit("invite",id);

	$(this).css('display','none');
	$(this).closest('div').find('.refuseBtn').css('display','inline');
}

function refuse() {
	let id = $(this).closest('div').attr("id");
	console.log("refuse " + id);
	socket.emit("refuse",id);

	$(this).css('display','none');
	$(this).closest('div').find('.inviteBtn').css('display','inline');
}

function play() {
	let id = $(this).closest('div').attr("id");
	console.log("play " + id);
	socket.emit("play",id);

	$(this).css('display','none');

}

function initSession() {
	socket.on('session id', (id) => {
		sessionId = id;
		console.log('get session id ' + sessionId);
	});
	socket.on('new name', (id,name)=>{
		console.log("get new name with id " + id + "; name " + name);
		var elDiv = $('#divPair').find('#'+id);
		if (elDiv.length==0) {
			elDiv = $("<div/>").attr("id",id);
			elP = $("<p/>");
			elP.append(name);
			
			inviteBtn = $("<button/>").attr("id","invite" + id).addClass("inviteBtn").click(invite);
			inviteBtn.append("Invite");
			refuseBtn = $("<button/>").attr("id","refuse"+id).css("display","none").addClass("refuseBtn").click(refuse);
			refuseBtn.append("Refuse");
			playBtn = $("<button/>").attr("id","play"+id).css("display","none").addClass("playBtn").click(play);
			playBtn.append("Play");

			elP.append(inviteBtn);
			elP.append(refuseBtn);
			elP.append(playBtn);

			elDiv.append(elP);

			$('#divPair').append(elDiv);
		}
	});
	socket.on('disconnect id', (id)=>{
		console.log("disconnected id " + id);
		$('#divPair').find('#'+id).remove();
	});
	socket.on('invited by', (aid) =>{
		console.log("invited by aid=" + aid);
		$('#' + aid + " .playBtn" ).css('display','inline');
		$('#' + aid + " .inviteBtn" ).css('display','none');
		$('#' + aid + " .refuseBtn" ).css('display','none');
	});
	socket.on('refused by', (aid) =>{
		console.log("refused by aid=" + aid);
		$('#' + aid + " .playBtn" ).css('display','none');
		$('#' + aid + " .inviteBtn" ).css('display','inline');
		$('#' + aid + " .refuseBtn" ).css('display','none');
	});
	socket.on('play with', (id, index)=> {
		initTable(index);
		$('#divPair').css('display','none');
		$('#divPlay').css('display','block');
		playWithId = id;
	});
}

