import {
	cellWidth,
	navbarHeight,
	dragThreshold,
	navbarWidth,
	buttonsWidth,
	buttonsDefaultIndicies
} from './config.js';

const actualNavbarWidth = navbarWidth * cellWidth;

const styleElement = document.createElement('style');
let styleContent = `
* {
	box-sizing: border-box;
}

body {
	background-color: #aaa;
	margin: 0px;
	padding: 0px;
}
 
#navbar {
	width: ${actualNavbarWidth}px;
	background-color: #ccc;
	display: flex;
	justify-content: flex-start;
	position: relative;
	height: ${navbarHeight}px;
	background-image: linear-gradient(
		90deg, 
		transparent ${cellWidth / 2}px, 
		grey ${cellWidth}px, 
		transparent ${cellWidth - 1}px
	);
	background-size: ${cellWidth}px;
	display: flex;
	align-items: center;
}


.buttons {
	padding: 0px;
	cursor: pointer;
	user-select: none;
	position: absolute;
	display:flex;
	justify-content:center;
	align-items:center;
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
		transparent ${cellWidth / 2}px, 
		grey ${cellWidth}px, 
		transparent ${cellWidth - 1}px
	);
	background-size: ${cellWidth}px;
	display: flex;
	justify-content:center;
	align-items:center;
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

const indexContainer = document.getElementById("index-container");

for (let i = 0; i < buttonsWidth.length; i++) {
	if (buttonsWidth[i] == 0) {
		throw new Error("config.js: button width of 0");
	}
	const buttonWidth = buttonsWidth[i] * cellWidth;
	styleContent += `#button${i} {
	background-color: lightblue;
	width: ${buttonWidth - 2 * dragThreshold}px;
	height: ${navbarHeight - 2 * dragThreshold}px;
}`;
}

for (var i = 0; i < navbarWidth; i++) {
	const elm = document.createElement("div");
	elm.className = "index";
	elm.innerText = i;
	elm.style.left = `${i * cellWidth}px`;
	indexContainer.appendChild(elm);
}

styleElement.textContent = styleContent;
document.head.appendChild(styleElement);