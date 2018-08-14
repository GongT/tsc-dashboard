import { ipcRenderer } from 'electron';
import * as $ from 'jquery';
import { CHANNEL_CREATE_TSCONFIG_SESSION, CHANNEL_OPEN_TSCONFIG } from 'ipc-channel';
import { IProcessPoolStarter } from 'session-controller/types';

export function askNewSession() {
	ipcRenderer.send(CHANNEL_OPEN_TSCONFIG);
}

export function handleInitNewSession(process: IProcessPoolStarter) {
	ipcRenderer.on(CHANNEL_CREATE_TSCONFIG_SESSION, (event, file) => () => {
		console.log('receive start request:', file);
		process.start(file);
	});
	// $('#btnAdd').on('click', askNewSession);
	$('#btnAdd').on('click', () => {
		process.start('/data/DevelopmentRoot/projects/tsc-dashboard/src/tsconfig.json');
	});
}
