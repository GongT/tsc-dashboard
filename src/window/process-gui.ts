import * as $ from 'jquery';
import { IProcessPoolHandler } from 'session-controller/types';

export function initFrame(p: IProcessPoolHandler) {
	const $linkContainer = $('#namesHolder');
	const nameTitleTemplate = '<a class="processLink mdl-navigation__link" href="###"></a>';

	p.handler(async (process) => {
		const $link = $(nameTitleTemplate).text(process.name).appendTo($linkContainer);

		$link.on('click', () => {
			process.activate();
		});

		const result = await process.waitExit();
		if (result.error) {
			$link.addClass('error');
		}

		$link.addClass('terminated');

		await process.waitCollect();

		$link.off().remove();
	});
}
