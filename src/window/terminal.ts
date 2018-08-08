import { Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import { terminalConfig } from 'window/terminal.config';
import * as $ from 'jquery';

let term: Terminal;

export function initTerminal() {
	term = new Terminal({});

	loadConfig();
	const lineHeight = term.getOption('lineHeight') * term.getOption('fontSize');

	const $p = $('#terminal');

	const rows = Math.floor($p.height() / lineHeight);
	term.setOption('rows', rows);
	console.log('rows=', rows);

	term.open($p[0]);
	fit(term);

	term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m ');
	term.write(new Array(100).fill('A').join('-'));

	$(window).on('resize', () => {
		fit(term);
	});
}

function loadConfig() {
	terminalConfig.forEach((value, key) => {
		term.setOption(key, value);
	});
	term.refresh(0, term.rows - 1);
}