'use strict';

import {
	NavbarButton,
	initButton
} from './button.js';

// ========================== //
//           Utils            //
// ========================== //

// caller is responsible for the creation of the div the navbar will be associated to
// name will be prepended to the className of all buttons of the navbar and their ids

// if name = 'coolNavbar' then its buttons' className would be 'coolNavbar-buttons' and their ids `coolNavbar-button${i}`
export function initNavbar(name, navbarDiv, cellWidth, cellPixelWidth, dragThreshold, buttonsCellWidth, buttonsDefaultIndicies, buttonsCallbacks) {

	// check that arguments are valid

	if (cellPixelWidth % 2 === 1) {
		throw new Error('initNavbar: prefer even cellPixelWidth');
	}

	let a = buttonsCellWidth.length;
	let b = buttonsDefaultIndicies.length;
	let c = buttonsCallbacks.length;
	if (a === 0 || b === 0 || c === 0 || a !== b || b !== c) {
		throw new Error('initNavbar: buttonsCellWidth and buttonsDefaultIndicies must be of the same length');
	}

	const minNavBarNbCells = computeMinNavBarWidth(buttonsCellWidth, buttonsDefaultIndicies);
	if (minNavBarNbCells > cellWidth) {
		throw new Error('initNavbar: navbar cellWidth too short for the requested buttons');
	}

	if (detectOverlap(buttonsCellWidth, buttonsDefaultIndicies, minNavBarNbCells)) {
		throw new Error('initNavbar: overlapping buttons');
	}

	// init

	const navbar = new Navbar(navbarDiv, cellWidth, cellPixelWidth, dragThreshold);
	for (let i = 0; i < buttonsCellWidth.length; i++) {
		const index = buttonsDefaultIndicies[i];
		const buttonDiv = document.createElement('div');
		buttonDiv.className = `${name}-buttons`;
		buttonDiv.id = `${name}-button${i}`;
		buttonDiv.style.left = `${index * cellPixelWidth}px`;
		buttonDiv.callback = buttonsCallbacks[i];
		// some default innerText
		buttonDiv.innerText = `Button ${i}`;
		navbarDiv.appendChild(buttonDiv);
		navbar.addButton(initButton(buttonDiv, buttonsDefaultIndicies[i], buttonsCellWidth[i], navbar));
	}

	navbarDiv.addEventListener('mouseup', (event) => {
		if (navbar.activeButton === null) { return; }
		if (navbar.moveActiveButton(event)) {
			// console.log(`try moving button at offset ${navbar.initialoffsetX} to offset ${navbar.activeButton.div.offsetLeft}`);
			// I hate JS
			navbar.activeButton = navbar.getButtonByDivId(navbar.activeButton.div.id);
			console.log(navbar.activeButton);
			if (navbar.tryMoveButton(navbar.activeButton)) {
				console.log('tryMoveButton: move successful');
				navbar.updateButtonsPosition();
			} else {
				console.log('tryMoveButton: move not possible');
				navbar.activeButton.div.style.left = `${navbar.initialoffsetX}px`;
			}
			navbar.activeButton.div.style.top = `${navbar.initialoffsetY}px`;
		} else {
			navbar.activeButton.div.callback(navbar.activeButton);
		}
		navbar.activeButton.div.style.cursor = 'pointer';
		navbar.dragging = false;
		navbar.activeButton = null;
	});

	return navbar;
}

function computeMinNavBarWidth(buttonsCellWidth, buttonsDefaultIndicies) {
	let maxIndex = 0;
	for (let i = 0; i < buttonsCellWidth.length; i++) {
		const defaultIndex = buttonsDefaultIndicies[i];
		const width = buttonsCellWidth[i];
		const buttonEnd = defaultIndex + width - 1;
		if (buttonEnd > maxIndex) { maxIndex = buttonEnd; }
	}
	return maxIndex + 1;
}

function detectOverlap(buttonsCellWidth, buttonsDefaultIndicies, minNavBarWidth) {
	const navbar = new Array(minNavBarWidth).fill(false);
	for (let i = 0; i < buttonsCellWidth.length; i++) {
		const defaultIndex = buttonsDefaultIndicies[i];
		const width = buttonsCellWidth[i];
		for (let j = 0; j < width; j++) {
			const position = defaultIndex + j;
			if (navbar[position]) { return true; }
			navbar[position] = true;
		}
	}
	return false;
}

// generate indicies in an alternating pattern prioritizing right for odd sizes
// going outward
function genIndicies1(n) {
	if (n === 0) { return []; }
	let center = Math.floor((n - 1) / 2);
	const indices = [center];
	let leftOffset = 1;
	let rightOffset = 1;
	while (indices.length < n) {
		if (center + rightOffset < n) { indices.push(center + rightOffset); }
		if (center - leftOffset >= 0) { indices.push(center - leftOffset); }
		leftOffset++;
		rightOffset++;
	}
	return indices;
}

// generate indicies in an alternating pattern prioritizing left for odd sizes
// going outward
function genIndicies2(n) {
	if (n === 0) { return []; }
	let center = Math.floor(n / 2);
	const indices = [center];
	let leftOffset = 1;
	let rightOffset = 1;
	while (indices.length < n) {
		if (center - leftOffset >= 0) { indices.push(center - leftOffset); }
		if (center + rightOffset < n) { indices.push(center + rightOffset); }
		leftOffset++;
		rightOffset++;
	}
	return indices;
}

export class Navbar {
	
	constructor(div, cellWidth, cellPixelWidth, dragThreshold) {
		this.div = div;
		this.cellWidth = cellWidth;
		this.cellPixelWidth = cellPixelWidth;
		this.pixelWidth = cellWidth * cellPixelWidth;
		this.buttons = [];
		this.activeButton = null;
		this.dragging = null;
		this.dragThreshold = dragThreshold;

		this.offsetX = 0;
		this.offsetY = 0;
		this.initialX = 0;
		this.initialY = 0;
		this.initialoffsetX = 0;
		this.initialoffsetY = 0;
	}

	addButton(button) {
		this.buttons.push(button);
	}

	getButtonByDivId(id) {
		return this.buttons.find(b => b.div.id === id);
	}

	deepCopyButtons() {
		return this.buttons.map(b => new NavbarButton(b.div, b.index, b.cellWidth, this));
	}

	indexOn(i) {
		return i >= 0 && i < this.cellWidth;
	}

	// perform the actual moves
	updateButtonsPosition() {
		this.buttons.forEach(b => {
			b.div.style.left = `${b.index * this.cellPixelWidth}px`;
		});
	}

	// return if the active button was moved
	moveActiveButton(event) {
		const currentX = event.clientX;
		const currentY = event.clientY;
		const deltaX = Math.abs(currentX - this.initialX);
		const deltaY = Math.abs(currentY - this.initialY);
		if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
			const x = currentX - this.offsetX;
			const y = currentY - this.offsetY;
			this.activeButton.div.style.left = `${x}px`;
			this.activeButton.div.style.top = `${y}px`;
			return true;
		}
		return false;
	}

	replaceButtons(src) {
		const dst = this.buttons;
		if (src.length !== dst.length) {
			throw new Error('replaceButtons: impossible case reached');
			return;
		}
		// console.log(`copying ${src}`);
		dst.splice(0, dst.length); dst.length = 0;
		src.forEach(button => dst.push(button));
	}

	// Non optimized, safe function to get all buttons indicies in buttons
	// that collide with button being at target excluding itself
	getCollisions(button, target) {
	// 	console.log(`getCollisions:
	// button =
	// ${button}
	// target =
	// ${target}
	// buttons =
	// ${this.buttons}
	// `)
		const tmp = new Set(); tmp.clear();
		this.buttons.forEach((b, i) => {
			for (let k = target; k < target + button.cellWidth; k++) {
				if (b.indexOn(k) && b.div.id !== button.div.id) {
					tmp.add(i);
				}
			}
		});
		const r = Array.from(tmp);
		// console.log(`${r}`);
		return r;
	}

	// collisions is an array of indicies in buttons that mark buttons as colliding
	// with button
	reOrderCollisions(src, button, buttons, collisions) {
		const target = button.index;
	// 	console.log(`reOrderCollisions
	// src =
	// ${src}
	// button =
	// ${button}
	// buttons =
	// ${buttons}
	// collisions =
	// ${collisions}`);
		// console.log('reOrderCollisions', {target});
		// blackmagic to ensure we handle collisions in the most sensible manner
		// alternating starts at the left or right depending on wether the button comes
		// from the left or right of the target
		// it also avoids a condition in the genIndicies function loop by comparing
		// what function to use for odd and even button cellWidth here
		const indices = (src < target
			? (button.cellWidth % 2 === 0 ? genIndicies2 : genIndicies1)
			: (button.cellWidth % 2 === 0 ? genIndicies1 : genIndicies2)
		)(button.cellWidth);
		// console.log('reOrderCollisions', {indices});
		const tmp = new Set(); tmp.clear();
		// backward since genIndicies functions give the indicies going outward
		for (let i = indices.length - 1; i >= 0; i--) {
			const navBarIndex = indices[i] + target;
			// console.log('reOrderCollisions', {navBarIndex});
			if (!this.indexOn(navBarIndex)) {
				throw new Error('collisionOrder: impossible case reached');
				continue;
			}
			collisions.forEach(collisionIndex => {
				if (buttons[collisionIndex].indexOn(navBarIndex)) {
					tmp.add(collisionIndex);
				}
			});
		}
		const r = Array.from(tmp);
		// console.log('reOrderCollisions', {r});
		return r;
	}

	// compute the 'cost' of shifting left iButton so that
	// it is outside of the forbidden area delimited by
	// [ jTarget, jTarget + jButton.cellWidth [

	// here jButton.index = jTarget already, the state of buttons is invalid
	// applies any intermediate move directly in buttons for (eventual) recursive calls

	// these two shift function basically try to restore buttons to a valid state
	// by getting iButton out of the way by only shifting left and the cost of doing so
	shiftLeftCost(iButtonIndex, src, jButton, buttons) {
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
		while (iTarget + iButton.cellWidth - 1 >= jButton.index) {
			if (iTarget === 0) { return Infinity; }
			iTarget--;
		}
		let cost = i - iTarget;
		const collisions = this.getCollisions(iButton, iTarget, buttons);
		// 	console.log(`shiftLeftCost: ${iButton} -> ${iTarget}
		// ${collisions}`);
		const iSrc = iButton.index;
		iButton.index = iTarget;
		// now iButton is out of the way, repeat for any collision it may cause
		// no need to call resolveCollisions since iButton was put just next to
		// jButton so there would be no room for any collision with iButton on its right
		// and if there were beyond jButton then it's sure to be of greater cost than going left
		this.reOrderCollisions(src, iButton, buttons, collisions).forEach(collision => {
			cost += this.shiftLeftCost(collision, iSrc, iButton, buttons);
			if (cost === Infinity) { return Infinity; }
		});
		return cost;
	}

	// same shit but right, stops if cost becomes greater than leftCost and return Infinity
	shiftRightCost(iButtonIndex, src, jButton, buttons, leftCost) {
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
		if (iTarget + iButton.cellWidth > this.cellWidth) { return Infinity; }
		while (iTarget <= jButton.index + jButton.cellWidth - 1) {
			if (iTarget + iButton.cellWidth === this.cellWidth) { return Infinity; }
			iTarget++;
		}
		let cost = iTarget - i;
		if (cost > leftCost) { return Infinity; }
		const collisions = this.getCollisions(iButton, iTarget, buttons);
		// 	console.log(`shiftRightCost: ${iButton} -> ${iTarget}
		// ${collisions}`);
		const iSrc = iButton.index;
		// console.log(`${iButton}`);
		iButton.index = iTarget;
		// console.log(`${iButton}`);
		this.reOrderCollisions(src, iButton, buttons, collisions).forEach(collision => {
			cost += this.shiftRightCost(collision, iSrc, iButton, buttons, leftCost);
			if (cost >= leftCost) { return Infinity; }
		});
		return cost;
	}

	// src is the source index where button was in buttons
	// collisions is a list of buttons that currently collide with button
	resolveCollisions(src, button, collisions) {
		const buttons = this.buttons;
		const target = button.index;
	// 	console.log(`button = ${button}
	// src = ${src}
	// target = ${target}
	// collisions = ${collisions}

	// buttons = ${buttons}
	// `);

		const reOrderedCollisions = this.reOrderCollisions(src, button, this.buttons, collisions);
		for (var i = 0; i < reOrderedCollisions.length; i++) {
	// 		console.log(`resolveCollisions: handling collision:
	// ${collision}`);
			const collision = reOrderedCollisions[i];
			let leftButtons = this.deepCopyButtons();
			let rightButtons = this.deepCopyButtons();

			let leftCost = this.shiftLeftCost(collision, src, button, leftButtons);
			let rightCost = this.shiftRightCost(collision, src, button, rightButtons, leftCost);

			// console.log(`${collision}`);

// 			console.log(`leftCost = ${leftCost}
// rightCost = ${rightCost}
// `);

			if (leftCost === Infinity && rightCost === Infinity) { return false; }
			if (leftCost === rightCost) {
				this.replaceButtons(src < target ? leftButtons : rightButtons, buttons);
			} else {
				this.replaceButtons(leftCost < rightCost ? leftButtons : rightButtons, buttons);
			}
		}
		return true;
	}

	// returns if the move is successful
	// makes sure the state of buttons is correct upon exit
	// the div of the given button is already where it wants to be moved
	tryMoveButton(button) {
		// console.log('tryMoveButton', {button, this.buttons});
		// make sure the move is possible while getting the target index
		const target = button.isMovePossible();
		// console.log(target);
		if (isNaN(target)) { return false; }
		// console.log('tryMoveButton', {target});
		const collisions = this.getCollisions(button, target);
		// console.log('tryMoveButton', {collisions});
		const src = button.index;
		// console.log('tryMoveButton', {src});
		// move the button where its div is
		button.index = target;
		// console.log(`button.index = ${button.index}`);
		// all good :)
		if (collisions.length === 0) { return true; }
		// no good :c
		// here buttons is now in an invalid state
		const backup = this.deepCopyButtons();
		// console.log(`${backup}`);
		if (!this.resolveCollisions(src, button, collisions)) {
			// restore buttons
			this.replaceButtons(backup);
			const actual_button = this.getButtonByDivId(button.div.id);
			actual_button.index = src;
			return false;
		}
		return true;
	}
}