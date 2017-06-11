let emptyText = '&nbsp;';
let text = ['1','2','3','4','5','6','7','8','9','10','&#9679;','&#9873;'];
let count = [1,1,2,3,4,4,4,5,8,1,6,1];
let value = [	[-3,-3,-3,-3,-3,-3,-3,-3,-3,-3],
				[-3,-3,-3,-3,-3,-3,-3,-3,-3,-3],
				[-3,-3,-3,-3,-3,-3,-3,-3,-3,-3],
				[-3,-3,-3,-3,-3,-3,-3,-3,-3,-3],
				[-1,-1,-2,-2,-1,-1,-2,-2,-1,-1],
				[-1,-1,-2,-2,-1,-1,-2,-2,-1,-1],
				[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]   ];
let turns = [];
let selTurn = undefined;
let selRow = -1;
let selCol = -1;
let selIndex = -1;
let init = false;
var selfStyle;
var oppositeStyle;
var selfTextStyle;
var oppositeTextStyle;

function initStyles(index) {
	if (index == 0) {
		selfStyle = 'primary';
		oppositeStyle = 'secondary';
		selfTextStyle = 'primaryText';
		oppositeTextStyle = 'secondaryText';
	} else {
		selfStyle = 'secondary';
		oppositeStyle = 'primary';
		selfTextStyle = 'secondaryText';
		oppositeTextStyle = 'primaryText';
	}
	$("#msg").addClass(selfTextStyle);
}

function initTable(index) {
	initConnection();
	initStyles(index);
	let elTable = $('#table');
	for (i = 0; i<10; i++) {
		let elTr = $("<tr/>").addClass("ddtr");
		for (t = 0; t<10; t++) {
			let elTd = $("<td/>").addClass("ddtd").addClass("maintd");
			let elDiv = $("<div/>").addClass("dddiv").attr("id","cell"+i+t);

			if (i<4) elDiv.addClass(oppositeStyle);
			if (i>5) elDiv.addClass("selectable").addClass(selfStyle);

			elDiv.on("click",{row:i, col:t}, (event) => {clickTable(event.data.row, event.data.col); } );
			elDiv.append(emptyText);
			elTd.append(elDiv);

			elTr.append(elTd);
		}
		elTable.append(elTr);
	}

	let elLegend = $('#legend');
	elTr = $("<tr/>").addClass("ddtr");
	for (t=0;t<12; t++) {
		let elTd = $("<td/>").addClass("ddtd").addClass("legendtd");
		let elDiv = $("<div/>").addClass("dddiv").addClass("selectable").addClass(selfStyle)
								.attr("id","legend"+t)
								.on("click",{index:t}, (event) => {clickLegend(event.data.index); } );
		elDiv.append(text[t]);
		elTd.append(elDiv);

		elTr.append(elTd);

	}
	elLegend.append(elTr);
	elTr = $("<tr/>");
	for (t=0;t<12;t++){
		let elTd = $("<td/>");
		let elDiv = $("<div/>").addClass("counterdiv").attr("id","counter"+t);

		elDiv.append(""+count[t]);
		elTd.append(elDiv);

		elTr.append(elTd);

	}
	elLegend.append(elTr);

	["42","43","52","53", "46","47","56","57"].forEach( (i)=> {$("#cell"+i).addClass("water")} );

	$("#divPlay").trigger("initialized");//event for tests
}

function clickTable(row,col) {
	if (!init) clickInitTable(row,col);
	else clickTurnTable(row,col);
}

function clickInitTable(row,col) {
	if (row<6) return;
	if (selIndex == -1) { // legend is not selected
		if (selRow == -1) { // nothing selected
			selectTable(row,col);
		} else {  // only table selected
			if (row == selRow && col == selCol) { //remove selection if the same cell clicked
				removeTableSelection();
			} else if (value[selRow][selCol] == -1) { //remove selection if empty cell was selected
				removeTableSelection();
				selectTable(row,col);
			} else { // move selected item to new clicked cell
				addCounter(value[row][col]);
				setValue(row,col, value[selRow][selCol]);
				setValue(selRow,selCol, -1);
				removeTableSelection();
			}
		}
	} else {
		addCounter(value[row][col]);
		setValue(row,col, selIndex);
		decCounter(selIndex);
		if (count[selIndex] == 0) removeLegendSelection();
	}
}

function clickLegend(index) {
	removeTableSelection();
	sel = selIndex;
	removeLegendSelection();
	if (index != sel) {
		if (count[index] > 0) selectLegend(index);
	}
}


function removeTableSelection() {
	if (selRow != -1) {
		$("#cell"+selRow+selCol).removeClass("selected");		
	}
	selRow = selCol = -1;	
}

function removeLegendSelection() {
	if (selIndex != -1) {
		$("#legend"+selIndex).removeClass("selected");		
	}
	selIndex = -1;	
}

function selectLegend(index) {
	selIndex = index;
	$("#legend"+selIndex).addClass("selected");		
}

function selectTable(row,col) {
	selRow = row;
	selCol = col;
	$("#cell"+selRow+selCol).addClass("selected");		
}

function addCounter(index) {
	changeCounter(index, 1);
}

function decCounter(index) {
	changeCounter(index, -1);
}

function changeCounter(index, value) {
	if (index == -1) return;
	count[index] += value;
	el = $("#counter"+index);

	if (count[index] == 0) {
		$("#legend"+index).removeClass(selfStyle).html(emptyText);
		el.html(emptyText);
	} else {
		el.html(count[index]);		
	}

	if (count[index] == 1 && value == 1) {
		$("#legend"+index).addClass(selfStyle).html(text[index]);
	}

	sum = 0;
	count.forEach( (val) => {sum+= val;} );
	if (sum == 0) {
		$("#btnNext").removeAttr("disabled");

		$("#divPlay").trigger("readyToStart"); //event for tests

	} else if (sum == 1 && value == 1) {
		$("#btnNext").attr("disabled","disabled");
	}
}

function setValue(row, col, val) {
	value[row][col] = val;
	$("#cell"+row+col).html(val == -1 ? emptyText : text[val]);
}


function removeClasses(list) {
//	list.forEach((c) => { $("."+c).removeClass(c)} );
	for (r=0;r<10;r++) {
		for (c=0;c<10;c++) {
			let el = $("#cell"+r+c);
			list.forEach( (cl)=> {
				if (el.hasClass(cl)) el.removeClass(cl);
			} )
		}
	}
}

function resetTableAttrs() {
	removeClasses(["move","attack","selected"]);
	selRow = selCol = -1;
	selTurn = undefined;
}
function action(a,row,col) {
	socket.emit(a,selRow,selCol,row,col); 
	resetTableAttrs();
	removeClasses(["selectable"]);
	turns = [];	
}
function move(row, col) {
	action("move",row,col);
}
function attack(row, col) {
	action("attack",row,col);
}

function clickTurnTable(row,col) {
	if (selTurn != undefined) {
		selTurn.move.forEach( (c) => { 
			if (c.row==row && c.col==col) {
				move(row,col);
			} 
		});
	}

	if (selTurn != undefined) {
		selTurn.attack.forEach( (c) => { 
			if (c.row==row && c.col==col) {
				attack(row,col);
			} 
		});
	}

	resetTableAttrs();
	turns.forEach( (t) => {
		if (t.row == row && t.col == col) {
			$("#cell" +row+col).addClass("selected");
			selRow = row;
			selCol = col;
			selTurn = t;
			
			t.move.forEach( (c) => {$("#cell"+c.row+c.col).addClass("move")}  );
			t.attack.forEach( (c) => {$("#cell"+c.row+c.col).addClass("attack")}  );
		}
	});
}

function animateMove(r,c, r1,c1, callback) {	
	let cell = $("#cell"+r+c);
	let htmlVal = cell.html();
	cell.html(emptyText);
	cell.removeClass(selfStyle).removeClass(oppositeStyle);


	let off = cell.offset();
	let val = value[r][c];

	var el = $("<div/>").addClass("dddiv").addClass(val == -3 ? oppositeStyle : selfStyle);
	el.css("position","absolute");
	el.offset({top: off.top, left: off.left});
	el.outerWidth(cell.outerWidth());
	el.outerHeight(cell.outerHeight());

	el.html(htmlVal);
	$('body').append(el);

	off = $("#cell"+r1+c1).offset();
	let styles = {};
	if (r != r1) styles.top = off.top;
	if (c != c1) styles.left = off.left;


	el.animate(styles,"slow", () => {
		el.remove();
		//cell.html(htmlValue);
		callback();
	});	

}

function newValue(v) {
	for (row=0; row<10; row++) {
		for (col=0; col<10; col++) {
			if (v[row][col] != value[row][col]) {
				let val = value[row][col] = v[row][col];

				let cell = $("#cell"+row+col).removeClass("primary").removeClass("secondary")
										.html(val >=0 ? text[val] : emptyText);

				if (val == -3) cell.addClass(oppositeStyle);
				else if (val >=0) cell.addClass(selfStyle);

			}
		}
	}
}

function span(text, style) {
	return $("<span/>").addClass(style).append(text);
}
function appendAttackMsg(el, val, val1, selfAttack) {
	let style = selfAttack ? selfTextStyle : oppositeTextStyle;
	let style1 = selfAttack ? oppositeTextStyle : selfTextStyle;

	if (val1 === 11) {
		el.append(span(text[val],style))
			.append(" has taken ")
			.append(span(text[val1],style1))
			.append(" !!!");
	} else if (val == 9 && val1 == 0) {
		el.append(span(text[val],style))
			.append(" has siezed  ")
			.append(span(text[val1],style1))
			.append(" !!!");
	} else if (val == 7 && val1 == 10) {
		el.append(span(text[val],style))
			.append(" has demined ")
			.append(span(text[val1],style1))
			.append(" !!!");
	} else if (val !=7 && val1 == 10) {
		el.append(span(text[val],style))
			.append(" has blown up on ")
			.append(span(text[val1],style1));
	} else if (val == val1) {
		el.append(span(text[val],style))
			.append(" attacked with draw ")
			.append(span(text[val1],style1));
	} else if (val < val1) {
		el.append(span(text[val],style))
			.append(" won ")
			.append(span(text[val1],style1));
	} else {
		el.append(span(text[val],style))
			.append(" lost in attack of ")
			.append(span(text[val1],style1));
	}
}

function addMsg(appendFunc) {
	let el = $("<li/>");
	appendFunc(el);
	$("#log").prepend(el);
}

function initConnection() {
	$("#btnNext").click(nextClick);
	socket.on("start game", () => {
		$("#legend").css("display","none");
		$("#btnNext").css("display","none");
		$("#msg").css("display", "inline");
	}).on("wait", () => {
		//console.log("Wait");
		$("#msg").html("<i>Wait your opponent turn</i>");
		//resetTableAttrs();
	}).on("your turn", (nextTurns) => {
		//console.log("your turn");
		$("#msg").html("<b>Your turn</b>");
		turns = nextTurns;
		turns.forEach( (t) => {
			$("#cell"+t.row+t.col).addClass("selectable");
		});
	}).on("new value", (v, r,c, r1,c1, l,l1, val,val1) => {	
		//console.log("new value %d,%d -> %d,%d; lose: %s,%s; values: %d,%d",r,c,r1,c1,l?"true":"false",l1?"true":"false",val,val1);
		removeClasses(["moveFrom","moveTo"]);

		if (!l && !l1) {
			animateMove(r,c,r1,c1, ()=> {
				newValue(v);
			});
		} else {
			if (value[r][c] == -3) $("#cell"+r+c).html(text[val]);
			if (value[r1][c1] == -3) $("#cell"+r1+c1).html(text[val1]);

			addMsg((el)=>{appendAttackMsg(el,val,val1,value[r][c]>=0)});

			animateMove(r,c,r1,c1, ()=> {
				newValue(v);
			});
			
		}

		$("#cell"+r+c).addClass("moveFrom");
		$("#cell"+r1+c1).addClass("moveTo");

	}).on("win", (cause) => {
		$("#msg").html("<b>You win :) !!!<b>");
		if (cause == "no move") {
			addMsg((el)=>{el.append(span("Opposite can't move !!!",oppositeTextStyle))});
		}
	}).on("lose", (cause) => {
		$("#msg").html("<b>You lose :( !!!</b>");
		if (cause == "no move") {
			addMsg((el)=>{el.append(span("You can't move !!!",selfTextStyle))});
		}
	});
}

function nextClick() {	
	socket.emit("initTable", value);
	$("#btnNext").attr("disabled","disabled");
	$(".selectable").removeClass("selectable");
	init = true;
}
