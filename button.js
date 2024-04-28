import {
	cellWidth,
	navbarHeight,
	dragThreshold,
	navbarWidth,
	buttonsWidth,
	buttonsDefaultIndicies
} from './config.js';

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

export function initButton(div, index, width, navbar) {

	const button = new Button(div, index, width, navbar);

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
			activeButton = navbar.getButtonByDivId(activeButton.div.id);
			if (navbar.tryMoveButton(activeButton)) {
				console.log("tryMoveButton: move successful");
				navbar.updateButtonsPosition();
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

// a better class name would be NavbarButton since this Button makes no sense if not in a Navbar
export class Button {
	constructor(div, index, width, navbar) {
		this.div = div;
		this.index = index;
		this.width = width;
		this.navbar = navbar;
	}

	indexOn(i) {
		return i >= this.index && i <= this.index + this.width - 1;
	}

	// returns if where the div of the button is, the move would be possible
	// and if so, returns the index in the navbar of where the div is
	isMovePossible() {
		const cellWidth = this.navbar.cellWidth;
		const halfCellWidth = this.navbar.cellWidth / 2;
		const visualOffset = this.div.offsetLeft + halfCellWidth;
		// console.log({this, visualOffset, cellWidth, actualTotalNavbarWidth});
		if (visualOffset >= 0
			&& this.div.offsetLeft <= this.navbar.pixelWidth - this.width * cellWidth + halfCellWidth) {
			return Math.floor(visualOffset / cellWidth);
		}
		return NaN;
	}

	toString() {
		return `
${this.div.id}:
index = ${this.index}
width = ${this.width}
`;
	}
}