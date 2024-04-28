import {
	cellWidth,
	navbarHeight,
	dragThreshold,
	navbarWidth,
	buttonsWidth,
	buttonsDefaultIndicies
} from './config.js';

import {
	Navbar,
	initNavbar
} from './navbar.js';

import {
	Button,
	initButton
} from './button.js';

// init Navbar

const navbarDiv = document.createElement("div");
navbarDiv.className = "navbars";
navbarDiv.id = "navbar0";
const navbar = initNavbar(navbarDiv, navbarWidth, cellWidth, buttonsWidth, buttonsDefaultIndicies);
