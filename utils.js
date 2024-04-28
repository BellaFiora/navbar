import {
	cellWidth,
	navbarHeight,
	dragThreshold,
	navbarWidth,
	buttonsWidth,
	buttonsDefaultIndicies
} from './config.js';

export class Button {
	constructor(div, index, width) {
		this.div = div;
		this.index = index;
		this.width = width;
	}

	toString() {
		return `
${this.div.id}:
index = ${this.index}
width = ${this.width}
`;
	}
}

const actualTotalNavbarWidth = navbarWidth * cellWidth;
const halfCellWidth = cellWidth / 2;

// free means a cell with no button on
// taken means a cell with a button on
// busy means a cell covered by a button
export const FREE = 0;
export const TAKEN = 1;
export const BUSY = 2;
export const stateToString = ["FREE", "TAKEN", "BUSY"];

function validIndex(i) {
	return i >= 0 && i < navbarWidth;
}

function validButton(button) {
	return button.index >= 0 && button.index + button.width <= navbarWidth;
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

// collisions is an array of indicies in buttons that mark buttons as colliding
// with button
export function reOrderCollisions(src, button, buttons, collisions) {
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
	// console.log("reOrderCollisions", {target});
	// blackmagic to ensure we handle collisions in the most sensible manner
	// alternating starts at the left or right depending on wether the button comes
	// from the left or right of the target
	// it also avoids a condition in the genIndicies function loop by comparing
	// what function to use for odd and even button width here
	// if (src < target) {
	// 	if (button.width % 2 === 0) {
	// 		genIndicies2
	// 	} else {
	// 		genIndicies1
	// 	}
	// } else {
	// 	if (button.width % 2 === 0) {
	// 		genIndicies1
	// 	} else {
	// 		genIndicies2
	// 	}
	// }
	const indices = (src < target
		? (button.width % 2 === 0 ? genIndicies2 : genIndicies1)
		: (button.width % 2 === 0 ? genIndicies1 : genIndicies2)
	)(button.width);
	// console.log("reOrderCollisions", {indices});
	const tmp = new Set(); tmp.clear();
	// backward since genIndicies functions give the indicies going outward
	for (let i = indices.length - 1; i >= 0; i--) {
		const navBarIndex = indices[i] + target;
		// console.log("reOrderCollisions", {navBarIndex});
		if (!validIndex(navBarIndex)) {
			console.log("collisionOrder: impossible case reached");
			continue;
		}
		collisions.forEach(collisionIndex => {
			if (indexOnButton(navBarIndex, buttons[collisionIndex])) {
				tmp.add(collisionIndex);
			}
		});
	}
	const r = Array.from(tmp);
	// console.log("reOrderCollisions", {r});
	return r;
}

export function pprint_buttons(buttons) {
	return buttons.map((button, idx) => 
		`Button ${idx}:\n` +
		`  Div: ${button.div.id}\n` +
		`  Index: ${button.index}\n` +
		`  Width: ${button.width}\n`
	).join("\n");
}

export function pprint_states(states) {
	let r = "---------------\n";
	if (states.length === 0) { return r; }
	r += stateToString[states[0]];
	for (var i = 1; i < states.length; i++) {
		r += ", " + stateToString[states[i]];
	}
	return r;
}

export function indexOnButton(i, button) {
	return i >= button.index && i <= button.index + button.width - 1;
}

export function getButtonIndex(i, states) {
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

// Non optimized, safe function to get all buttons indicies in buttons
// that collide with button being at target excluding itself
export function getCollisions(button, target, buttons) {
// 	console.log(`getCollisions:
// button =
// ${button}
// target =
// ${target}
// buttons =
// ${buttons}
// `)
	const tmp = new Set(); tmp.clear();
	buttons.forEach((b, i) => {
		for (let k = target; k < target + button.width; k++) {
			if (indexOnButton(k, b) && b.div.id !== button.div.id) {
				tmp.add(i);
			}
		}
	});
	const r = Array.from(tmp);
	// console.log(`${r}`);
	return r;
}

export function moveIndex(button) {
	const visualOffset = button.div.offsetLeft + halfCellWidth;
	// console.log({button, visualOffset, cellWidth, actualTotalNavbarWidth});
	if (visualOffset >= 0 && button.div.offsetLeft <= actualTotalNavbarWidth - button.width * cellWidth + halfCellWidth) {
		// console.log("YESSSSSSSS");
		return Math.floor(visualOffset / cellWidth);
	}
	// console.log("NOOOOOOO");
	return NaN;
}

export function generateCellsState(buttons) {
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

export function deepCopyButtons(buttons) {
	return buttons.map(button => new Button(button.div, button.index, button.width));
}

export function getButtonByDivId(buttonDivId, buttons) {
	return buttons.find(button => button.div.id === buttonDivId);
}