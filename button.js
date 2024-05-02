'use strict';

export function initButton(div, index, cellWidth, navbar) {

	if (cellWidth === 0) {
		throw new Error('button\'s cellWidth of 0');
	}

	const button = new NavbarButton(div, index, cellWidth, navbar);

	div.addEventListener('mousedown', (event) => {
		if (navbar.activeButton !== null) {
			// cursor speed exeeded browser's refresh rate or something
			// and the user was able to let go of the hold and click back on the button
			// while technically still in dragging

			// we could reset:
			// console.log('weird state, resetting active button');
			// navbar.activeButton.div.style.left = `${navbar.initialoffsetX}px`;
			// navbar.activeButton.div.style.top = `${navbar.initialoffsetY}px`;
			// navbar.activeButton.div.style.cursor = 'pointer';
			// navbar.dragging = false;
			// navbar.activeButton = null;
			
			// or just ignore and continue with previous state:
			return;
		}
		navbar.activeButton = button;
		navbar.initialX = event.clientX;
		navbar.initialY = event.clientY;
		navbar.offsetX = event.clientX - div.offsetLeft;
		navbar.offsetY = event.clientY - div.offsetTop;
		navbar.initialoffsetX = div.offsetLeft - navbar.dragThreshold;
		navbar.initialoffsetY = div.offsetTop;
		navbar.dragging = false;
		div.style.cursor = 'grabbing';
		event.preventDefault();
	});

	div.addEventListener('mousemove', (event) => {
		if (navbar.activeButton) { navbar.moveActiveButton(event); }
	});

	return button;
}

// a better class name would be NavbarButton since this Button makes no sense if not in a Navbar
export class NavbarButton {
	constructor(div, index, cellWidth, navbar) {
		this.div = div;
		this.index = index;
		this.cellWidth = cellWidth;
		this.navbar = navbar;
	}

	indexOn(i) {
		return i >= this.index && i <= this.index + this.cellWidth - 1;
	}

	// returns if where the div of the button is, the move would be possible
	// and if so, returns the index in the navbar of where the div is
	isMovePossible() {
		const cellPixelWidth = this.navbar.cellPixelWidth;
		const halfcellPixelWidth = this.navbar.cellPixelWidth / 2;
		const visualOffset = this.div.offsetLeft + halfcellPixelWidth;
		if (visualOffset >= 0
			&& this.div.offsetLeft <= this.navbar.pixelWidth - this.cellWidth * cellPixelWidth + halfcellPixelWidth) {
			return Math.floor(visualOffset / cellPixelWidth);
		}
		return NaN;
	}

	toString() {
		return `
${this.div.id}:
index = ${this.index}
cellWidth = ${this.cellWidth}
`;
	}
}