const { app, BrowserWindow } = require('electron');
const { resolve } = require('path');
const { is } = require('electron-util');

console.log('hello world!');

const debug = is.development;

if (debug) {
	console.log('debug enabled.');
}

require('electron-unhandled')();
require('electron-debug')({
	enabled: true,
	showDevTools: debug,
	devToolsMode: 'right',
});

const ROOT = resolve(__dirname, '..');

app.on('ready', () => {
	const mainWindow = new BrowserWindow({
		width: debug? 1600 : 800,
		height: 600,
		x: 0,
		y: 0,
		center: true,
		title: 'Typescript Compiler Manager',
		backgroundColor: '#eaeaea',
	});
	console.log('main window created');
	mainWindow.setMenu(null);
	mainWindow.loadFile(resolve(ROOT, 'frame.html'));

	mainWindow.on('closed', () => {
		process.exit();
	});
});