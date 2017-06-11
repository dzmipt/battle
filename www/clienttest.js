function initTest() {
	if ( $.url('?test') != undefined) {
		$('#divTest').css('display','block');
	}
}

const primaryName = 'Primary';
const secondaryName = 'Secondary';
const primaryValue = [	[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[11,10,11,5,6,11,5,5,11,1],
						[9,11,6,6,8,8,5,4,3,12],
						[9,7,7,6,8,9,7,4,3,4],
						[9,9,9,9,9,11,8,8,7,2]   ];

let secondaryValue = [	[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
						[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]   ];
for (r=6; r<10; r++) {
	for (c=0; c<10; c++) {
		secondaryValue[r][c]=primaryValue[r][9-c];
	}
}

function testPrimary() {
	disableBtns();
	initTestSession(true);
	$("#divPlay").on("initialized", () => {setTable(primaryValue);} )
				 .on("readyToStart", () => { $("#btnNext").click(); } );
}

function testSecondary() {
	disableBtns();
	initTestSession(false);
	$("#divPlay").on("initialized", () => {setTable(secondaryValue);} )
				 .on("readyToStart", () => { $("#btnNext").click(); } );

}

function disableBtns() {
	$('#btnPrimary').attr("disabled","disabled");
	$('#btnSecondary').attr("disabled","disabled");	
}

function initTestSession(isPrimary) {
	var otherId;
	socket.on('new name', (id,name)=> {
		if (isPrimary && name == secondaryName) {
			otherId = id;
			$("#invite"+id).click();
		} else if (!isPrimary && name == primaryName) {
			otherId = id;
		}
	});
	if (!isPrimary) {
		socket.on('invited by', (id) => {
			if (id == otherId) {
				$("#play"+id).click();
			}
		});
	}

	$("#inpName").val(isPrimary ? primaryName : secondaryName);
	$("#btnSend").click();

}

function setTable(value) {
	var prevV;
	for (row=6; row<10; row++) {
		for (col=0; col<10; col++) {
			v = value[row][col]-1;
			if (prevV != v) $("#legend"+v).click();
			$("#cell"+row+col).click();
			prevV = v;
		}
	}
}