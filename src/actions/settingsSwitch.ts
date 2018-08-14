import * as $ from 'jquery';

export function initSettingsPage() {
	const $btnOther = $('#btnTrash,#btnAdd,#btnReload');

	const $btnSwitch = $('#btnSettings');
	const $tabTerminal = $('#terminal');
	const $tabSettings = $('#settings');

	const toggleClass = ['mdl-button--raised', 'mdl-button--accent'];

	let showState = false;
	$btnSwitch.on('click', () => {
		showState = !showState;
		if (showState) {
			$btnSwitch.addClass(toggleClass);
			$btnOther.attr('disabled', 'disabled');
			$tabTerminal.hide();
			$tabSettings.show();
		} else {
			$btnSwitch.removeClass(toggleClass);
			$btnOther.removeAttr('disabled');
			$tabTerminal.show();
			$tabSettings.hide();
		}
	});
}
