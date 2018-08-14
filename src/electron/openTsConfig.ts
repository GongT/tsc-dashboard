import { BrowserWindow, dialog, Event } from 'electron';
import { createTsconfigSession } from 'electron/newInstance';

export function handleOpenRequest(window: BrowserWindow) {
	return (event: Event) => {
		const files = dialog.showOpenDialog(window, {
			title: 'Open tsconfig.json File',
			filters: [
				{ name: 'tsconfig', extensions: ['json'] },
				{ name: 'All Files', extensions: ['*'] },
			],
			properties: ['openFile'],
		});
		console.log('open file:', files);
		if (files && files[0]) {
			createTsconfigSession(files[0]);
		}
	};
}