process.env.MAIN_FILE = __filename;
if (process.env.__TSDASHBOARD_CHILD) {
	process.title = 'tsc';

	process.on('uncaughtException', (e) => {
		console.error(e);
		process.exit(1);
	});
	process.on('unhandledRejection', (e) => {
		console.error(e);
		process.exit(1);
	});

	require('app-module-path').addPath(`${__dirname}`);
	require('electron/worker');
} else {
	process.title = 'tsc-dashboard';

	console.log('hello world!');

	const debug = require('electron-util').is.development;

	if (debug) {
		console.log('debug enabled.');
	} else {
		require('electron-unhandled')();
	}

	require('electron-debug')({
		enabled     : true,
		showDevTools: debug,
		devToolsMode: 'right',
	});

	require('app-module-path').addPath(`${__dirname}`);
	require('electron/loader');
}