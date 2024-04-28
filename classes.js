export class Navbar {
	buttons = [];
	
	// width is in number of cells
	constructor(div, width, cellWidth) {
		this.div = div;
		this.width = width;
		this.cellWidth = cellWidth;
		this.pixelWidth = width * cellWidth;
	}

	addButton(button) {
		buttons.push(button);
	}

	getButtonByDivId(id) {
		return this.buttons.find(b => b.div.id === id);
	}

	deepCopyButtons() {
		return this.buttons.map(b => new Button(b.div, b.index, b.width, this));
	}

	indexOn(i) {
		return i >= 0 && i < this.width;
	}

	// perform the actual moves
	updateButtonsPosition() {
		this.buttons.forEach(b => {
			b.div.style.left = `${b.index * this.cellWidth}px`;
		});
	}

	copyButtons(src) {
		const dst = this.buttons;
		if (src.length !== dst.length) {
			throw new Error("copyButtons: impossible case reached");
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
			for (let k = target; k < target + button.width; k++) {
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
	reOrderCollisions(src, button, collisions) {
		const buttons = this.buttons;
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
				throw new Error("collisionOrder: impossible case reached");
				continue;
			}
			collisions.forEach(collisionIndex => {
				if (buttons[collisionIndex].indexOn(navBarIndex)) {
					tmp.add(collisionIndex);
				}
			});
		}
		const r = Array.from(tmp);
		// console.log("reOrderCollisions", {r});
		return r;
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

		const reOrderedCollisions = this.reOrderCollisions(src, button, collisions);
		for (var i = 0; i < reOrderedCollisions.length; i++) {
	// 		console.log(`resolveCollisions: handling collision:
	// ${collision}`);
			const collision = reOrderedCollisions[i];
			let leftButtons = this.deepCopyButtons();
			let rightButtons = this.deepCopyButtons();

			let leftCost = shiftLeftCost(collision, src, button, leftButtons);
			let rightCost = shiftRightCost(collision, src, button, rightButtons, leftCost);

			// console.log(`${collision}`);

			console.log(`leftCost = ${leftCost}
	rightCost = ${rightCost}
	`);

			if (leftCost === Infinity && rightCost === Infinity) { return false; }
			if (leftCost === rightCost) {
				copyButtons(src < target ? leftButtons : rightButtons, buttons);
			} else {
				copyButtons(leftCost < rightCost ? leftButtons : rightButtons, buttons);
			}
		}
		return true;
	}

	// returns if the move is successful
	// makes sure the state of buttons is correct upon exit
	// the div of the given button is already where it wants to be moved
	tryMoveButton(button) {
		// console.log("tryMoveButton", {button, this.buttons});
		// make sure the move is possible while getting the target index
		const target = button.isMovePossible();
		if (isNaN(target)) { return false; }
		// console.log("tryMoveButton", {target});
		const collisions = this.getCollisions(button, target);
		// console.log("tryMoveButton", {collisions});
		const src = button.index;
		// console.log("tryMoveButton", {src});
		// move the button where its div is
		button.index = target;
		// console.log(`button.index = ${button.index}`);
		// all good :)
		if (collisions.length === 0) { return true; }
		// no good :c
		// here buttons is now in an invalid state
		const backup = this.deepCopyButtons();
		// console.log(`${backup}`);
		if (!resolveCollisions(src, button, collisions)) {
			// restore buttons
			copyButtons(backup);
			const actual_button = this.getButtonByDivId(button.div.id);
			actual_button.index = src;
			return false;
		}
		return true;
	}
}