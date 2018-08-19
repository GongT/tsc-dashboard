import { WindowCreator } from 'electron/global';
import { app, BrowserWindow, Event, ipcMain } from 'electron';
import { resolve } from 'path';
import { is } from 'electron-util';
import { onNewInstance } from 'electron/newInstance';
import { handleOpenRequest } from 'electron/openTsConfig';
import { CHANNEL_OPEN_TSCONFIG, CHANNEL_READY } from 'ipc-channel';

export const loader = new WindowCreator(async () => {
	const debug = is.development;
	const ROOT = resolve(__dirname, '../..');

	const mainWindow = new BrowserWindow({
		width          : debug? 1600 : 800,
		height         : 600,
		x              : 0,
		y              : 0,
		center         : true,
		title          : 'Typescript Compiler Manager',
		backgroundColor: '#eaeaea',
	});
	mainWindow.setMenu(null);
	mainWindow.loadFile(resolve(ROOT, 'frame.html'));

	mainWindow.on('closed', () => {
		console.log('Bye, Bye~');
		process.exit();
	});

	await new Promise((resolve, reject) => {
		ipcMain.once(CHANNEL_READY, function (event: Event, type: string, error?: Error) {
			console.log('CHANNEL_READY:', type);
			if (type === 'ready') {
				resolve();
			} else {
				console.log(error);
				reject(Object.assign(new Error, error));
			}
		});
	});

	ipcMain.on(CHANNEL_OPEN_TSCONFIG, handleOpenRequest(mainWindow));

	return mainWindow;
});

if (app.makeSingleInstance(onNewInstance)) {
	console.log('running instance exists.');
	process.exit(0);
}

loader.loadApplication().catch(e => {
	setImmediate(() => {
		throw e;
	});
});

if (process.argv.length > 1) {
	onNewInstance(process.argv.slice(1), process.cwd());
}

