import { loader } from 'electron/loader';
import { CHANNEL_CREATE_TSCONFIG_SESSION } from 'ipc-channel';
import { resolve } from 'path';
import { lstatSync } from 'fs';
import { is } from 'electron-util';

const selfCommandLength = is.development? 2 : 1;

export function onNewInstance(argv: string[], workingDirectory: string) {
	let extraState = false;

	console.log(argv, workingDirectory);
	for (const item of argv.slice(selfCommandLength)) {
		if (extraState) {
			tryItem(resolve(workingDirectory, item));
		} else if (item === '--') {
			extraState = true;
		} else if (item[0] !== '-') {
			tryItem(resolve(workingDirectory, item));
		}
	}
}

export function createTsconfigSession(file: string) {
	console.log('create session: %s', file);
	loader.wait().then((win) => {
		console.log('send: CREATE_TSCONFIG_SESSION');
		win.webContents.send(CHANNEL_CREATE_TSCONFIG_SESSION, file);
	});
}

function tryItem(path: string) {
	console.log('start with argument: ', path);
	if (/.json$/.test(path)) {
		createTsconfigSession(path);
	} else if (mlstatSync(path, 'isDirectory')) {
		const tsconfig = resolve(path, 'tsconfig.json');
		if (mlstatSync(tsconfig, 'isFile')) {
			createTsconfigSession(tsconfig);
		}
	}
}

function mlstatSync(f: string, method: 'isDirectory' | 'isFile') {
	try {
		const stat = lstatSync(f);
		return stat[method]();
	} catch (e) {
		return false;
	}
}