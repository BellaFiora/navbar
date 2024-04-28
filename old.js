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
export function getCollisionsFromInvalidState(button, target, buttons) {
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
export function getCollisions(button, target, buttons) {
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