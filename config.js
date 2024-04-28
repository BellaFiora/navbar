// in pixels
export const cellWidth = 50;
export const navbarHeight = 50;
export const dragThreshold = 3;
// multiples of cellWidth
export const navbarWidth = 100;
export const buttonsWidth 			= [2, 3, 10];
export const buttonsDefaultIndicies = [6, 2, 10];

// automatic, do not modify

let a = buttonsDefaultIndicies.length;
let b = buttonsWidth.length;
if (a === 0 || b === 0 || a !== b) {
	throw new Error("config.js: invalid config");
}

const minNavBarWidth = computeMinNavBarWidth(buttonsWidth, buttonsDefaultIndicies);
if (minNavBarWidth > navbarWidth) {
	throw new Error("config.js: navbarWidth too short");
}

if (detectOverlap(buttonsWidth, buttonsDefaultIndicies, minNavBarWidth)) {
	throw new Error("config.js: overlapping buttons");
}

// utils only for this file

function computeMinNavBarWidth(widths, indices) {
	let maxIndex = 0;
	for (let i = 0; i < widths.length; i++) {
		const defaultIndex = indices[i];
		const width = widths[i];
		const buttonEnd = defaultIndex + width - 1;
		if (buttonEnd > maxIndex) { maxIndex = buttonEnd; }
	}
	return maxIndex + 1;
}

function detectOverlap(widths, indices, minNavBarWidth) {
	const navbar = new Array(minNavBarWidth).fill(false);
	for (let i = 0; i < widths.length; i++) {
		const defaultIndex = indices[i];
		const width = widths[i];
		for (let j = 0; j < width; j++) {
			const position = defaultIndex + j;
			if (navbar[position]) { return true; }
			navbar[position] = true;
		}
	}
	return false;
}