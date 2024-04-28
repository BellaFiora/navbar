import {
	cellWidth,
	navbarHeight,
	dragThreshold,
	navbarWidth,
	buttonsWidth,
	buttonsDefaultIndicies
} from './config.js';

import {
	FREE, TAKEN, BUSY, stateToString,
	reOrderCollisions,
	pprint_buttons,
	pprint_states,
	indexOnButton,
	getButtonIndex,
	getCollisions,
	moveIndex,
	deepCopyButtons,
	Button,
	getButtonByDivId
} from './utils.js';

// ============================= //
//              Init             //
// ============================= //

// globals used for the grabbing, dragging and dropping buttons part

let offsetX, offsetY, initialX, initialY, initialoffsetX, initialoffsetY;
let activeButton = null;
let dragging = false;

// return if the active button was moved
function moveActiveButton(event) {
	const currentX = event.clientX;
	const currentY = event.clientY;
	const deltaX = Math.abs(currentX - initialX);
	const deltaY = Math.abs(currentY - initialY);
	if (deltaX > dragThreshold || deltaY > dragThreshold) {
		const x = currentX - offsetX;
		const y = currentY - offsetY;
		activeButton.div.style.left = `${x}px`;
		activeButton.div.style.top = `${y}px`;
		return true;
	}
	return false;
}

function initButton(div, index, width) {
	const button = new Button(div, index, width);

	div.addEventListener("mousedown", (event) => {
		activeButton = button;
		initialX = event.clientX;
		initialY = event.clientY;
		offsetX = event.clientX - div.offsetLeft;
		offsetY = event.clientY - div.offsetTop;
		initialoffsetX = div.offsetLeft - dragThreshold;
		initialoffsetY = div.offsetTop;
		dragging = false;
		div.style.cursor = "grabbing";
		event.preventDefault();
	});

	div.addEventListener("mousemove", (event) => {
		if (activeButton) { moveActiveButton(event); }
	});

	document.addEventListener("mouseup", (event) => {
		if (activeButton === null) { return; }
		if (moveActiveButton(event)) {
			// console.log(`try moving button at offset ${initialoffsetX} to offset ${activeButton.div.offsetLeft}`);
			// I hate JS
			activeButton = getButtonByDivId(activeButton.div.id, buttons);
			if (tryMoveButton(activeButton, buttons)) {
				console.log("tryMoveButton: move successful");
				applyNewPositions(buttons);
			} else {
				console.log("tryMoveButton: move not possible");
				activeButton.div.style.left = `${initialoffsetX}px`;
			}
			activeButton.div.style.top = `${initialoffsetY}px`;
		} else {
			activeButton.div.callback();
		}
		activeButton.div.style.cursor = "pointer";
		dragging = false;
		activeButton = null;
	});

	return button;
}

// init Buttons

const navbar = document.getElementById("navbar");
let buttons = []; buttons.length = 0;

for (let i = 0; i < buttonsWidth.length; i++) {
	const div = document.createElement("div");
	const width = buttonsWidth[i];
	const index = buttonsDefaultIndicies[i];
	div.className = "buttons";
	div.id = `button${i}`;
	div.style.left = `${index * cellWidth}px`;
	div.innerText = `Button ${i}`;
	div.callback = () => { console.log(`Button ${i} called`); };
	navbar.appendChild(div);
	buttons.push(initButton(div, buttonsDefaultIndicies[i], width));
}

// console.log(`navbarWidth = ${navbarWidth}\n${buttons}`);

// ============================= //
//          Algorithm            //
// ============================= //

// compute the "cost" of shifting left iButton so that
// it is outside of the forbidden area delimited by
// [ jTarget, jTarget + jButton.width [

// here jButton.index = jTarget already, the state of buttons is invalid
// applies any intermediate move directly in buttons for (eventual)
// future recursive calls

// these two shift function basically try to restore buttons to a valid state
// by getting iButton out of the way by only shifting left and its returning
function shiftLeftCost(iButtonIndex, src, jButton, buttons) {
	const iButton = buttons[iButtonIndex];
// 	console.log(`shiftLeftCost:
// iButton:
// ${iButton}
// src:
// ${src}
// jButton:
// ${jButton}
// buttons:
// ${buttons}
// `);
	let i = iButton.index;
	let iTarget = i - 1;
	if (iTarget < 0) { return Infinity; }
	while (iTarget + iButton.width - 1 >= jButton.index) {
		if (iTarget === 0) { return Infinity; }
		iTarget--;
	}
	let cost = i - iTarget;
	const collisions = getCollisions(iButton, iTarget, buttons);
// 	console.log(`shiftLeftCost: ${iButton} -> ${iTarget}
// ${collisions}`);
	const iSrc = iButton.index;
	iButton.index = iTarget;
	// now iButton is out of the way, repeat for any collision it may cause
	// no need to call resolveCollisions since iButton was put just next to
	// jButton it could so there would be no room for any collision with iButton on its right
	// and if there were beyond jButton then it's sure to be of greater cost than going left
	reOrderCollisions(src, iButton, buttons, collisions).forEach(collision => {
		cost += shiftLeftCost(collision, iSrc, iButton, buttons);
		if (cost === Infinity) { return Infinity; }
	});
	return cost;
}

// same shit but right, stops if cost becomes greater than leftCost and return Infinity
function shiftRightCost(iButtonIndex, src, jButton, buttons, leftCost) {
	const iButton = buttons[iButtonIndex];
// 	console.log(`shiftRightCost:
// iButton:
// ${iButton}
// src:
// ${src}
// jButton:
// ${jButton}
// buttons:
// ${buttons}
// `);
	let i = iButton.index;
	let iTarget = i + 1;
	if (iTarget + iButton.width > navbarWidth) { return Infinity; }
	while (iTarget <= jButton.index + jButton.width - 1) {
		if (iTarget + iButton.width === navbarWidth) { return Infinity; }
		iTarget++;
	}
	let cost = iTarget - i;
	if (cost > leftCost) { return Infinity; }
	const collisions = getCollisions(iButton, iTarget, buttons);
// 	console.log(`shiftRightCost: ${iButton} -> ${iTarget}
// ${collisions}`);
	const iSrc = iButton.index;
	// console.log(`${iButton}`);
	iButton.index = iTarget;
	// console.log(`${iButton}`);
	reOrderCollisions(src, iButton, buttons, collisions).forEach(collision => {
		cost += shiftRightCost(collision, iSrc, iButton, buttons, leftCost);
		if (cost >= leftCost) { return Infinity; }
	});
	return cost;
}

function copyButtons(src, dst) {
	// console.log(`copying ${src}`);
	dst.splice(0, dst.length); dst.length = 0;
	src.forEach(button => dst.push(button));
	// moves.forEach(([button, target]) => {
	// 	// buttons here are from the deep copied buttons array
	// 	// modifying them would have no effect for the next collision applyNewPositions call
	// 	const actualButton = buttons.find(b => b.index === button.index);
	// 	if (actualButton === undefined) {
	// 		console.log("applyMoves: impossible case reached");
	// 		return;
	// 	}
	// 	actualButton.index = target;
	// });
}

// src is the source index where button was in buttons
// collisions is a list of buttons that currently collide with button
function resolveCollisions(src, button, buttons, collisions) {
	const target = button.index;
// 	console.log(`button = ${button}
// src = ${src}
// target = ${target}
// collisions = ${collisions}

// buttons = ${buttons}
// `);

	reOrderCollisions(src, button, buttons, collisions).forEach(collision => {
// 		console.log(`resolveCollisions: handling collision:
// ${collision}`);

		let leftButtons = deepCopyButtons(buttons);
		let rightButtons = deepCopyButtons(buttons);

		let leftCost = shiftLeftCost(collision, src, button, leftButtons);
		let rightCost = shiftRightCost(collision, src, button, rightButtons, leftCost);

		// console.log(`${collision}`);

		console.log(`leftCost = ${leftCost}
rightCost = ${rightCost}`);

		if (leftCost === Infinity && rightCost === Infinity) { return false; }
		if (leftCost === rightCost) {
			copyButtons(src < target ? leftButtons : rightButtons, buttons);
		} else {
			copyButtons(leftCost < rightCost ? leftButtons : rightButtons, buttons);
		}
	});
	return true;
}

// perform the actual moves
function applyNewPositions(buttons) {
	buttons.forEach(button => {
		button.div.style.left = `${button.index * cellWidth}px`;
	});
}

// returns if the move is successful
// makes sure the state of buttons is correct upon exit
function tryMoveButton(button, buttons) {
	// console.log("tryMoveButton", {button, buttons});
	// make sure the move is possible while getting the target index
	const target = moveIndex(button);
	if (isNaN(target)) { return false; }
	// console.log("tryMoveButton", {target});
	const collisions = getCollisions(button, target, buttons);
	// console.log("tryMoveButton", {collisions});
	const src = button.index;
	// console.log("tryMoveButton", {src});
	button.index = target;
	// console.log(`button.index = ${button.index}`);
	if (collisions.length === 0) { return true; }
	// here buttons is now in an invalid state
	const backup = deepCopyButtons(buttons);
	if (!resolveCollisions(src, button, buttons, collisions)) {
		// restore backup in buttons
		button.index = src;
		return false;
	}
	return true;
}