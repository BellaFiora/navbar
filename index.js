'use strict';

import {
	initNavbar
} from './navbar.js';

// init Navbar

// buttons' callbacks are given themselves as sole argument
const basicCallback = b => console.log(`Button ${b.div.id} called`);

const navbarDiv = document.createElement('div');
navbarDiv.className = 'navbars';
navbarDiv.id = 'navbar0';
const buttonsWidth 			 = [3, 1, 1, 1, 1, 1, 1, 1];
const buttonsDefaultIndicies = [0, 4, 5, 6, 7, 8, 3, 9];
const buttonsCallbacks = new Array(buttonsWidth.length).fill(basicCallback);
const navbarWidth = 10;
const cellPixelWidth = 50;
const navbarName = 'test';
// how many pixels before a mouse movement is considered to be moving the button
// holding the mouse click in this area will click the button when released
// the area is a square of side dragThreshold * 2 + 1 pixels
const dragThreshold = 3;
const navbar = initNavbar(navbarName, navbarDiv, navbarWidth, cellPixelWidth, dragThreshold, buttonsWidth, buttonsDefaultIndicies, buttonsCallbacks);
document.body.appendChild(navbarDiv);

// generate the associated CSS for this test navbar

const navbarHeight = cellPixelWidth;
const actualNavbarWidth = navbarWidth * cellPixelWidth;

const styleElement = document.createElement('style');
let styleContent = `
* {
	box-sizing: border-box;
}

body {
	background-color: #bbb;
	margin: 0px;
	padding: 0px;
}

#navbar0 {
	left: 70px;
	top: 70px;
	width: ${actualNavbarWidth}px;
	background-color: #ccc;
	display: flex;
	justify-content: flex-start;
	position: relative;
	height: ${navbarHeight}px;
	background-image: linear-gradient(
		90deg, 
		transparent ${cellPixelWidth / 2}px, 
		grey ${cellPixelWidth}px, 
		transparent ${cellPixelWidth - 1}px
	);
	background-size: ${cellPixelWidth}px;
	align-items: center;
}


.${navbarName}-buttons {
	padding: 0px;
	cursor: pointer;
	user-select: none;
	position: absolute;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: ${dragThreshold}px;
}

#index-container {
	width: ${actualNavbarWidth}px;
	background-color: #ccc;
	display: flex;
	justify-content: flex-start;
	position: relative;
	height: ${navbarHeight}px;
	background-image: linear-gradient(
		90deg, 
		transparent ${cellPixelWidth / 2}px, 
		grey ${cellPixelWidth}px, 
		transparent ${cellPixelWidth - 1}px
	);
	background-size: ${cellPixelWidth}px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.index {
	padding: 0px;
	cursor: pointer;
	user-select: none;
	position: absolute;
	display:flex;
	justify-content:center;
	align-items:center;
	margin-left: ${dragThreshold}px;
}
`;



for (let i = 0; i < buttonsWidth.length; i++) {
	const buttonWidth = buttonsWidth[i] * cellPixelWidth;
	styleContent += `#${navbarName}-button${i} {
	background-color: lightblue;
	width: ${buttonWidth - 2 * dragThreshold}px;
	height: ${navbarHeight - 2 * dragThreshold}px;
}`;
}

const indexContainer = document.createElement('div');
indexContainer.setAttribute('id', 'index-container');
for (var i = 0; i < navbarWidth; i++) {
	const elm = document.createElement('div');
	elm.className = 'index';
	elm.innerText = i;
	elm.style.left = `${i * cellPixelWidth}px`;
	indexContainer.appendChild(elm);
}
// document.body.appendChild(indexContainer);

styleElement.textContent = styleContent;
document.head.appendChild(styleElement);