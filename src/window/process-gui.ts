import * as $ from 'jquery';
import { processes } from 'global';
import { IProcessState } from 'session-controller/types';
import { ProcessStatus } from 'session-controller/process-state';

enum Status {
	IDLE = 'check_circle_outline',
	HAS_ERROR = 'report_problem',
	RUNNING = '',
	EXITED = 'delete_forever',
}

function spinner($parent: JQuery, $icon: JQuery) {
	const $run = $('<div class="mdl-spinner is-active mdl-js-spinner"></div>').prependTo($parent); // is-active
	componentHandler.upgradeElement($run[0]);
	let showState: boolean;
	return {
		spin() {
			if (showState) {
				return;
			}
			showState = true;
			$icon.hide();
			$run.show().addClass('is-active');
			componentHandler.upgradeElement($run[0]);
		},
		stop() {
			if (!showState) {
				return;
			}
			showState = false;
			$run.hide().removeClass('is-active');
			$icon.show();
			componentHandler.upgradeElement($icon[0]);
			componentHandler.upgradeElement($run[0]);
		},
		kill() {
			this.stop();
			componentHandler.downgradeElements($run[0]);
			$run.remove();
			this.stop = () => {};
			this.spin = () => {};
		},
	};
}

export function initFrame() {
	const $linkContainer = $('#namesHolder');

	$('#btnTrash').on('click', () => {
		const current = processes.getCurrentProcess();
		if (current) {
			current.exitOrCollect();
		}
	});
	$('#btnReload').on('click', () => {
		const current = processes.getCurrentProcess();
		if (current) {
			current.reset();
		}
	});

	const dialog = document.querySelector('#instanceConfig') as HTMLDialogElement;
	dialog.querySelector('.save').addEventListener('click', () => {

	});
	dialog.querySelector('.close').addEventListener('click', () => {
		dialog.close();
	});

	let currentLink: string;
	$linkContainer.on('mousedown', '.processLink', function (event) {
		switch (event.which) {
			case 1:
				return;
			case 2:
				event.preventDefault();
				return;
			case 3:
				event.preventDefault();
				dialog.showModal();
				return;
		}
	});
	$linkContainer.on('click', '.processLink', async function (event) {
		const $link = $(this);
		if (currentLink === $link.attr('id')) {
			return;
		}
		currentLink = $link.attr('id');

		$link.addClass('mdl-navigation__link--current');

		await ($link.data('process') as Readonly<IProcessState>).activate();

		$link.removeClass('mdl-navigation__link--current');
	});

	const nameTitleTemplate = '<a class="processLink mdl-navigation__link" href="###"></a>';
	processes.handler(async (process: Readonly<IProcessState>) => {
		const id = 'link_' + Math.random();
		const $link = $(nameTitleTemplate)
			.data('process', process)
			.attr({
				title: process.name,
				id,
			})
			.appendTo($linkContainer);

		const $linkTip = $('<div>')
			.attr({
				class: 'mdl-tooltip mdl-tooltip--large mdl-tooltip--right',
				for  : id,
			})
			.text(process.detail)
			.appendTo($linkContainer);
		componentHandler.upgradeElement($linkTip[0]);

		const $icon = $('<div class="icon material-icons">')
			.appendTo($link);

		$('<span>')
			.text(process.name)
			.appendTo($link);

		const spin = spinner($link, $icon);

		componentHandler.upgradeElement($icon[0]);

		spin.spin();
		$icon.text(Status.RUNNING);

		process.onStateChange(handler);
		$link.trigger('click');

		const result = await process.waitExit();
		console.log('[ui] process exited.');

		$icon.text(Status.EXITED);
		spin.kill();

		if (result['code'] !== 0) {
			$link.addClass('error');
		} else {
			$link.removeClass('error');
		}
		$link.addClass('terminated');

		await process.waitCollect();
		console.log('[ui] process collected.');
		$link.remove();

		function handler(status: ProcessStatus) {
			switch (status) {
				case ProcessStatus.IDLE:
					$link.removeClass('error');
					$icon.text(Status.IDLE);
					spin.stop();
					break;
				case ProcessStatus.BUSY:
					$link.removeClass('error');
					spin.spin();
					break;
				case ProcessStatus.ERROR:
					$link.addClass('error');
					$icon.text(Status.HAS_ERROR);
					spin.stop();
					break;
			}
		}
	});
}
