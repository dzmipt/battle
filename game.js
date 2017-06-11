var games=[];

exports.initGame = function(aSocket,bSocket) {
	var game = {};
	game.id = games.length;
	games.push(game);

	game.socket = [aSocket, bSocket];
	game.init = [false, false];

	game.value = [	[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
					[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
					[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
					[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
					[-1,-1,-2,-2,-1,-1,-2,-2,-1,-1],
					[-1,-1,-2,-2,-1,-1,-2,-2,-1,-1],
					[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
					[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
					[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
					[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]   ];
	game.valueIndex = [	[0,0,0,0,0,0,0,0,0,0],
						[0,0,0,0,0,0,0,0,0,0],
						[0,0,0,0,0,0,0,0,0,0],
						[0,0,0,0,0,0,0,0,0,0],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[1,1,1,1,1,1,1,1,1,1],
						[1,1,1,1,1,1,1,1,1,1],
						[1,1,1,1,1,1,1,1,1,1],
						[1,1,1,1,1,1,1,1,1,1]   ];

	game.nextTurn = 0;

	return game.id;
}

function reverse(index) {
	return index==0;
}

function convert(index, row) {
	return reverse(index) ? 9-row : row;
}

exports.isInit = function(id) {
	let g = games[id];
	return g.init[0] && g.init[1];
}

const count = [1,1,2,3,4,4,4,5,8,1,6,1];
function checkInitValue(value) {
	let c = count.slice();
	for (r=6; r<10; r++) {
		for (c=0; c<10; c++) {
			v = value[r][c];
			if (v < 0 || v >= c.length) {
				console.error("initValue id=%d, r=%d,c=%d wrong value: %d", id,c,r,v);
				return false;
			}
			c[v]--;
		}
	}
	for (i=0; i<c.length; i++) {
		if (c[i] !=0 ) {
			console.error("initValue id=%d, wrong count index=%d, count=%d", id, i, count[i]-c[i]);
			return false;
		}
	}

	return true;
}

exports.initTable = function(id, index, value) {
	let g = games[id];
	if (g.init[index]) {
		console.error("initTable id=%d, index=%d - already initalised", id, index);
		return;		
	}

	if ( !checkInitValue(value) ) return;

	for (r=6; r<10; r++) {
		for (c=0; c<10; c++) {
			let row = convert(index,r);
			g.value[row][c] = value[r][c];
		}
	}

	g.init[index] = true;
	g.socket[index].emit("start game");
	if (g.init[0] && g.init[1]) {
		nextTurn(g);
	} else {
		g.socket[index].emit("wait");
	}

}

function checkTurnValue(g, t, r, c, index) {
	if (r<0 || r>9 || c<0 || c>9) return;
	if (g.value[r][c] == -2) return;
	if (g.valueIndex[r][c] == index) return;

	if (g.value[r][c] == -1) {
		t.move.push({row:r, col:c});
	} else {
		t.attack.push({row:r, col:c});
	}
}

function nextTurn(g) {
	g.socket[g.nextTurn].emit("wait");
	g.nextTurn = 1 - g.nextTurn;
	let index = g.nextTurn;

	let turns = [];

	for (r=0; r<10; r++) {
		for (c=0; c<10; c++) {
			if (g.valueIndex[r][c] == index && g.value[r][c]<10) {
				let t = {move:[], attack:[]};

				checkTurnValue(g, t, r-1, c, index);
				checkTurnValue(g, t, r+1, c, index);
				checkTurnValue(g, t, r, c-1, index);
				checkTurnValue(g, t, r, c+1, index);

				if (t.move.length == 0 && t.attack.length == 0) continue;


				t.row = reverse(index)? 9-r : r;
				t.col = c;

				if (reverse(index)) {
					t.move.forEach( (val,i)=>{t.move[i].row = 9-t.move[i].row;});
					t.attack.forEach( (val,i)=>{t.attack[i].row = 9-t.attack[i].row;});
				}
				turns.push(t);
			}
		}
	}

	if (turns.length == 0) {
		g.socket[index].emit("lose","no move");
		g.socket[1-index].emit("win", "no move");
	} else {
		g.socket[index].emit("your turn", turns);		
	}
}

function checkRowCol(x) {
	return x>=0 && x<10; 
}

function checkAction(g,index,r,c,r1,c1) {
	if (!checkRowCol(r) || !checkRowCol(r1) || !checkRowCol(c) || !checkRowCol(c1) ) {
		console.error("action: wrong row/col %d, %d, %d, %d", r, c, r1, c1);
		return false;
	}
	let dr = Math.abs(r-r1);
	let dc = Math.abs(c-c1);
	if (! ( (dr==1 && dc==0) || (dr==0 && dc==1) ) ) {
		console.error("action: wrong location %d, %d, %d, %d", r,c,r1,c1);
		return false;
	} 

	if (index != g.nextTurn) {
		console.error("action: wrong index %d", index);
		return false;
	}
	return true;	
}
function checkMove(g,index,r,c,r1,c1) {
	if (! checkAction(g,index,r,c,r1,c1)) return false;

	if (! (g.valueIndex[r][c] == index && g.value[r][c]<10 && g.valueIndex[r1][c1] == -1) ) {
		console.error("move: wrong value index=%d, oldValueIndex=%d, newValueIndex=%d, value=%d", index, 
							g.valueIndex[r][c], g.valueIndex[r1][c1], g.value[r][c]);
		return false;
	}

	return true;
}

function checkAttack(g,index,r,c,r1,c1) {
	if (! checkAction(g,index,r,c,r1,c1)) return false;
	
	if (! (g.valueIndex[r][c] == index && g.value[r][c]<10 && g.valueIndex[r1][c1] == 1-index) ) {
		console.error("attack: wrong value index=%d, oldValueIndex=%d, newValueIndex=%d, value=%d", index, 
							g.valueIndex[r][c], g.valueIndex[r1][c1], g.value[r][c]);
		return false;
	}

	return true;
}

function getClientValue(g, index) {
	let v = [];
	for (r=0; r<10; r++) {
		let vr = [];
		for (col=0; col<10; col++) {
			let row = convert(index,r);
			if (g.valueIndex[row][col] == 1-index) vr.push(-3);
			else vr.push(g.value[row][col]);
		}
		v.push(vr);
	}
	return v;
}

exports.move = function(id, index, r, col, r1, col1) {
	let row = convert(index,r);
	let row1 = convert(index,r1);
	let g = games[id];
	if (! checkMove(g,index,row,col,row1,col1)) return;

	g.value[row1][col1] = g.value[row][col];
	g.value[row][col] = -1;
	g.valueIndex[row][col] = -1;
	g.valueIndex[row1][col1] = index;


	for (i=0; i<2; i++) {
		g.socket[i].emit("new value", getClientValue(g,i), convert(i,row), col, convert(i,row1), col1, false, false, -1, -1);
	}

	nextTurn(g);
}
exports.attack = function(id, index, r, col, r1, col1) {
	let row = convert(index,r);
	let row1 = convert(index,r1);
	let g = games[id];
	if (! checkAttack(g,index,row,col,row1,col1)) return;

	let v = g.value[row][col];
	let v1 = g.value[row1][col1];

	let win = false;

	let lose = false;
	let lose1 = false;

	if (v == v1 || (v!=7 && v1==10) ) { //draw
		g.value[row][col] = g.value[row1][col1] = -1;
		g.valueIndex[row][col] = g.valueIndex[row1][col1] = -1;
		
		lose = lose1 = true;
	} else if ( (v<v1 && v1<10) || 
				(v==7 && v1==10) ||
				(v==9 && v1==0) ||
				v1 == 11 ) { //win
		g.value[row1][col1] = g.value[row][col];
		g.value[row][col] = -1;
		g.valueIndex[row][col] = -1;
		g.valueIndex[row1][col1] = index;

		lose1 = true;
		win = (v1==11);
	}  else { //lose
		g.value[row][col] = -1;
		g.valueIndex[row][col] = -1;

		lose = true;
	}

	for (i=0; i<2; i++) {
		g.socket[i].emit("new value", getClientValue(g,i), convert(i,row), col, convert(i,row1), col1, lose, lose1, v, v1);
	}

	nextTurn(g);

	if (win) {
		g.socket[index].emit("win","flag");
		g.socket[1-index].emit("lose","flag");		
	}
}
