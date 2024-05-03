'use strict';

import {
	initNavbar
} from './navbar.js';

// init Navbar1

// buttons' callbacks are given themselves as sole argument
const basicCallback = b => console.log(`Button ${b.div.id} called`);

const navbarDiv = document.createElement('div');
navbarDiv.id = 'navbar1';
const buttonsWidth 			 = [3, 1, 1, 1, 1, 1, 1, 1];
const buttonsDefaultIndicies = [0, 4, 5, 6, 7, 8, 3, 9];
const buttonsCallbacks = new Array(buttonsWidth.length).fill(basicCallback);
const navbarWidth = 10;
const cellPixelWidth = 50;
const navbarPixelHeight = cellPixelWidth;
const navbarName = 'test';
// how many pixels before a mouse movement is considered to be moving the button
// holding the mouse click in this area will click the button when released
// the area is a square of side dragPixelThreshold * 2 + 1 pixels
// same for dragTimeThreshold in milliseconds
const dragPixelThreshold = 3;
const dragTimeThreshold = 20;
const navbar = initNavbar(navbarName, navbarDiv, navbarWidth, cellPixelWidth,
	navbarPixelHeight, dragPixelThreshold, dragTimeThreshold,
	buttonsWidth, buttonsDefaultIndicies, buttonsCallbacks);
document.body.appendChild(navbarDiv);
const actualNavbarWidth = navbarWidth * cellPixelWidth;

// init Navbar2

// buttons' callbacks are given themselves as sole argument
const basicCallback2 = b => console.log(`Button ${b.div.id} called`);

const navbarDiv2 = document.createElement('div');
navbarDiv2.id = 'navbar1';
const buttonsWidth2 			 = [3, 1, 1, 1, 1, 1, 1, 1];
const buttonsDefaultIndicies2 = [0, 4, 5, 6, 7, 8, 3, 9];
const buttonsCallbacks2 = new Array(buttonsWidth2.length).fill(basicCallback2);
const navbarWidth2 = 10;
const cellPixelWidth2 = 50;
const navbarPixelHeight2 = cellPixelWidth2;
const navbarName2 = 'test';
const dragPixelThreshold2 = 3;
const dragTimeThreshold2 = 3000;
const navbar2 = initNavbar(navbarName2, navbarDiv2, navbarWidth2, cellPixelWidth2,
	navbarPixelHeight2, dragPixelThreshold2, dragTimeThreshold2,
	buttonsWidth2, buttonsDefaultIndicies2, buttonsCallbacks2);
document.body.appendChild(navbarDiv2);
const actualNavbarWidth2 = navbarWidth2 * cellPixelWidth2;

// generate the associated CSS for these test navbars

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

#navbar1 {
	left: 0px;
	top: 0px;
	display: flex;
	justify-content: flex-start;
	position: relative;
	align-items: center;
	background-image: linear-gradient(
		90deg, 
		transparent ${cellPixelWidth / 2}px, 
		grey ${cellPixelWidth}px, 
		transparent ${cellPixelWidth - 1}px
	);
	background-size: ${cellPixelWidth}px;
	width: ${actualNavbarWidth}px;
	height: ${navbarPixelHeight}px;
	background-color: #ccc;
}

#navbar2 {
	left: 200px;
	top: 200px;
	display: flex;
	justify-content: flex-start;
	position: relative;
	align-items: center;
	background-image: linear-gradient(
		90deg, 
		transparent ${cellPixelWidth2 / 2}px, 
		grey ${cellPixelWidth2}px, 
		transparent ${cellPixelWidth2 - 1}px
	);
	background-size: ${cellPixelWidth2}px;
	width: ${actualNavbarWidth2}px;
	height: ${navbarPixelHeight2}px;
	background-color: #ccc;
}

.${navbarName}-buttons {
	padding: 0px;
	cursor: pointer;
	user-select: none;
	position: absolute;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: ${dragPixelThreshold}px;
}

.${navbarName2}-buttons {
	padding: 0px;
	cursor: pointer;
	user-select: none;
	position: absolute;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: ${dragPixelThreshold2}px;
}

#index-container {
	width: ${actualNavbarWidth}px;
	background-color: #ccc;
	display: flex;
	justify-content: flex-start;
	position: relative;
	height: ${navbarPixelHeight}px;
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
	margin-left: ${dragPixelThreshold}px;
}
`;

for (let i = 0; i < buttonsWidth.length; i++) {
	const buttonWidth = buttonsWidth[i] * cellPixelWidth;
	styleContent += `#${navbarName}-button${i} {
	background-color: lightblue;
	width: ${buttonWidth - 2 * dragPixelThreshold}px;
	height: ${navbarPixelHeight - 2 * dragPixelThreshold}px;
}`;
}

for (let i = 0; i < buttonsWidth2.length; i++) {
	const buttonWidth2 = buttonsWidth2[i] * cellPixelWidth2;
	styleContent += `#${navbarName2}-button${i} {
	background-color: lightblue;
	width: ${buttonWidth2 - 2 * dragPixelThreshold2}px;
	height: ${navbarPixelHeight2 - 2 * dragPixelThreshold2}px;
}`;
}

// const indexContainer = document.createElement('div');
// indexContainer.setAttribute('id', 'index-container');
// for (var i = 0; i < navbarWidth; i++) {
// 	const elm = document.createElement('div');
// 	elm.className = 'index';
// 	elm.innerText = i;
// 	elm.style.left = `${i * cellPixelWidth}px`;
// 	indexContainer.appendChild(elm);
// }
// document.body.appendChild(indexContainer);

styleElement.textContent = styleContent;
document.head.appendChild(styleElement);