import * as $ from 'jquery';

export function handleResizeEvent(delayMs: number) {
	let timer: NodeJS.Timer;
	const delayFinish = Symbol('resize');
	$(window).on('resize', function (e, signal) {
		if (delayFinish === signal) {
			return;
		}
		e.stopImmediatePropagation();

		clearTimeout(timer);
		timer = setTimeout(function () {
			$(window).trigger('resize', [delayFinish]);
		}, delayMs);
	});
}