import * as $ from 'jquery';

export function initSettingsPage() {
	const $btnOther = $('#btnTrash,#btnAdd,#btnReload');

	const $btnSwitch = $('#btnSettings');
	const $tabTerminal = $('#terminal');
	const $tabSettings = $('#settings');
	const $namesHolder = $('.mdl-layout__drawer');

	const toggleClass = ['mdl-button--raised', 'mdl-button--accent'];

	let showState = false;
	$btnSwitch.on('click', () => {
		showState = !showState;
		if (showState) {
			$namesHolder.addClass('disabled');
			$btnSwitch.addClass(toggleClass);
			$btnOther.attr('disabled', 'disabled');
			$tabTerminal.hide();
			$tabSettings.show();
		} else {
			$namesHolder.removeClass('disabled');
			$btnSwitch.removeClass(toggleClass);
			$btnOther.removeAttr('disabled');
			$tabTerminal.show();
			$tabSettings.hide();
		}
	});
}
