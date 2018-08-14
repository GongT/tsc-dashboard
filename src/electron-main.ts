require('electron-unhandled')();

if (process.env.__TSDASHBOARD_CHILD) {
	console.log('tsc is running with arguments: ', process.argv);
	require('typescript/lib/tsc');
} else {
	console.log('hello world!');
	const debug = require('electron-util').is.development;

	if (debug) {
		console.log('debug enabled.');
	}

	require('electron-debug')({
		enabled     : true,
		showDevTools: debug,
		devToolsMode: 'right',
	});

	require('app-module-path').addPath(`${__dirname}`);
	require('electron/loader');
}