// the three following function assume the action is possible
// and the current state of the navBar is correct
function partialMoveButton(i, j, iButtonWidth) {
	if (buttons[i] == null || i == j) {
		console.log("moveButton: impossible case reached");
		return;
	}
	if (cellsState[i] == TAKEN) {
		cellsState[i] = FREE; 
	}
	let k = 0;
	for (k = i + 1; k - i < iButtonWidth && k < navbarWidth && cellsState[k] == BUSY; k++) {
		cellsState[k] = FREE;
	}
	cellsState[j] = TAKEN;
	for (k = j + 1; k - j < iButtonWidth && k < navbarWidth; k++) {
		cellsState[k] = BUSY;
	}
	buttons[i].style.left = `${j * cellWidth}px`;
}

function moveButton(i, j, iButtonWidth) {
	partialMoveButton(i, j, iButtonWidth);
	buttons[j] = buttons[i];
	buttons[i] = null;
	// console.log(pprint_buttons());
}

function swapButtons(i, j, iButtonWidth, jButtonWidth) {
	partialMoveButton(i, j, iButtonWidth);
	partialMoveButton(j, i, jButtonWidth);
	tmp = buttons[i];
	buttons[i] = buttons[j];
	buttons[j] = tmp;
}

function removeButton(button, states) {
	let i = button.index;
	if (states[i] != TAKEN) {
		console.log("simulateMove: impossible case reached");
		return null;
	}
	states[i] = FREE;
	for (let k = i + 1; k - i < button.width; k++) {
		if (states[k] != BUSY) {
			console.log("simulateMove: impossible case reached");
			return null;
		}
		states[k] = FREE;
	}
}

// do not worry about what's already there
function placeButton(button, target, states) {
	for (let k = target + 1; k - target < button.width; k++) { states[k] = BUSY; }
	states[target] = TAKEN;
}

function simulateMove(button, target, states) {
	removeButton(button, states);
	placeButton(button, target, states);
}

// return buttons that collide with button being at target
function getCollisionsFromInvalidState(button, target, buttons) {
	let collisions = new Array(); collisions.length = 0;
	for (let i = target; i - target < button.width; i++) {
		buttons.forEach(button => {
			if (indexOnButton(i, button)) {
				collisions.push(button);
				// cannot break since more than one button can be on i
				// since buttons could be in any state
			}
		});
	}
	return collisions;
}

// assumes buttons are sorted by they offset and non overlapping
function getCollisions(button, target, buttons) {
	const collisions = []; collisions.length = 0;
	let i = 0;
	for (i; i < buttons.length; i++) {
		if (buttons[i].index + buttons[i].width <= target) { continue; }
		break;
	}
	for (; i < buttons.length && buttons[i].index <= target + button.width - 1; i++) {
		if (buttons[i].div.id !== button.div.id) {
			collisions.push(buttons[i]);
		}
	}
	return collisions;
}

function generateCellsState(buttons) {
	let r = new Array(navbarWidth.length).fill(FREE);
	buttons.forEach(button => {
		if (!validButton(button)) {
			console.log("generateCellsState: impossible case reached");
		}
		for (var j = 1; j < button.width; j++) { r[button.index + j] = BUSY; }
	});
	buttons.forEach(button => { r[button.index] = TAKEN; });
	return r;
}


function pprint_states(states) {
	let r = "---------------\n";
	if (states.length === 0) { return r; }
	r += stateToString[states[0]];
	for (var i = 1; i < states.length; i++) {
		r += ", " + stateToString[states[i]];
	}
	return r;
}

function validButton(button) {
	return button.index >= 0 && button.index + button.width <= navbarWidth;
}


function pprint_buttons(buttons) {
	return buttons.map((button, idx) => 
		`Button ${idx}:\n` +
		`  Div: ${button.div.id}\n` +
		`  Index: ${button.index}\n` +
		`  Width: ${button.width}\n`
	).join("\n");
}

function getButtonIndex(i, states) {
	if (states[i] === FREE) { return -1; }
	if (states[i] === TAKEN) { return i; }
	while (i > 0) {
		i--;
		if (states[i] === TAKEN) { return i; }
	}
	console.log("getButtonIndex: impossible case reached");
	return -1;
}

function getButtonByIndex(buttons, i) {
	return buttons.find(button => button.index === i);
}
