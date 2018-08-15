import * as $ from 'jquery';
import { SIGNAL_MESSAGE_ID } from 'actions/typescriptLocale';
import { processes } from 'global';

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
	const nameTitleTemplate = '<a class="processLink mdl-navigation__link" href="###"></a>';

	$('#btnTrash').on('click', () => {
		const current = processes.getCurrentProcess();
		if (current) {
			current.collect();
		}
	});
	$('#btnReload').on('click', () => {
		const current = processes.getCurrentProcess();
		if (current) {
			current.reset();
		}
	});

	processes.handler(async (process) => {
		const $link = $(nameTitleTemplate).append($('<span>').text(process.name)).appendTo($linkContainer);
		const $icon = $('<div class="icon material-icons">').prependTo($link);
		const spin = spinner($link, $icon);

		componentHandler.upgradeElement($icon[0]);

		spin.spin();
		$icon.text(Status.RUNNING);

		process.stdout.on('data', handler);

		$link.on('click', async () => {
			$link.addClass('mdl-navigation__link--current');

			await process.activate();

			$link.removeClass('mdl-navigation__link--current');
		}).trigger('click');

		const result = await process.waitExit();

		process.stdout.removeListener('data', handler);

		$icon.text(Status.EXITED);
		spin.kill();

		if (result['code'] !== 0) {
			$link.addClass('error');
		} else {
			$link.removeClass('error');
		}
		$link.addClass('terminated');

		await process.waitCollect();

		$link.off().remove();

		function handler(line) {
			const messageType = processes.tscfg.testLine(line);
			if (!messageType) {
				return;
			}
			console.log('%s|%s|', SIGNAL_MESSAGE_ID[messageType], line);

			switch (messageType) {
				case SIGNAL_MESSAGE_ID.FILE_CHANGE:
					$link.removeClass('error');
					spin.spin();
					break;
				case SIGNAL_MESSAGE_ID.ERROR_SINGLE:
				case SIGNAL_MESSAGE_ID.ERROR_MULTIPLE:
					$link.addClass('error');
					$icon.text(Status.HAS_ERROR);
					spin.stop();
					break;
				case SIGNAL_MESSAGE_ID.SUCCESS:
					$link.removeClass('error');
					$icon.text(Status.IDLE);
					spin.stop();
					break;
			}
		}
	});
}
