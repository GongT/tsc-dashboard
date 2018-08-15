import { ipcRenderer } from 'electron';
import * as $ from 'jquery';
import { CHANNEL_CREATE_TSCONFIG_SESSION, CHANNEL_OPEN_TSCONFIG } from 'ipc-channel';
import { processes } from 'global';

export function askNewSession() {
	ipcRenderer.send(CHANNEL_OPEN_TSCONFIG);
}

export function handleInitNewSession() {
	ipcRenderer.on(CHANNEL_CREATE_TSCONFIG_SESSION, (event, file) => () => {
		console.log('receive start request:', file);
		processes.start(file);
	});
	// $('#btnAdd').on('click', askNewSession);
	$('#btnAdd').on('click', () => {
		processes.start('/data/DevelopmentRoot/projects/tsc-dashboard/test/tsconfig.json');
	});
}
