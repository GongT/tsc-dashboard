import { RendererType, Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import { terminalConfig } from 'window/terminal.config';
import * as $ from 'jquery';
import { remote } from 'electron';
import { IProcessPoolHandler } from 'session-controller/types';

export function initTerminal(pPool: IProcessPoolHandler) {
	const gpuState = '' + remote.app.getGPUFeatureStatus()['2d_canvas'];
	let render: RendererType;
	if (/enabled/.test(gpuState)) {
		render = 'canvas';
	} else {
		render = 'dom';
		console.warn('GPU is off, DOM render is used for terminal.');
	}

	const $p = $('#terminal');

	const config = { ...terminalConfig.store };
	const lineHeight = config.lineHeight * config.fontSize;
	const rows = Math.floor($p.height() / lineHeight);

	const term = new Terminal({
		...config,
		rows,
		rendererType: render,
	});
	term.open($p[0]);
	fit(term);

	$(window).on('resize', fit.bind(undefined, term));

	pPool.output.on('data', (data) => {
		debugger;
		term.write(data);
	});
}
