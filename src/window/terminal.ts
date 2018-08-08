import { Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import { terminalConfig } from 'window/terminal.config';
import * as $ from 'jquery';

let term: Terminal;

export function initTerminal() {
	term = new Terminal({});

	loadConfig();

	term.open(document.querySelector('#terminal .sizer'));
	term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m ');
	term.write(new Array(100).fill('A').join('-'));

	fit(term);

	$(window).on('resize', () => {
		console.log('fit');
		fit(term);
	});
}

function loadConfig() {
	terminalConfig.forEach((value, key) => {
		term.setOption(key, value);
	});
	term.refresh(0, term.rows - 1);
}