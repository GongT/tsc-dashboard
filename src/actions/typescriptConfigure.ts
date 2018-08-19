import { Locales } from 'actions/typescriptConfigureConfig';

export enum SIGNAL_MESSAGE_ID {
	ERROR_SINGLE = 1,
	ERROR_MULTIPLE,
	FILE_CHANGE,
	SUCCESS,
}

const signalMessageIds: any[][] = [
	[SIGNAL_MESSAGE_ID.SUCCESS, 'Found_0_errors_Watching_for_file_changes_6194', '0'],
	[SIGNAL_MESSAGE_ID.ERROR_SINGLE, 'Found_0_errors_Watching_for_file_changes_6194', '\\d+'],
	[SIGNAL_MESSAGE_ID.ERROR_MULTIPLE, 'Found_1_error_Watching_for_file_changes_6193'],
	[SIGNAL_MESSAGE_ID.FILE_CHANGE, 'File_change_detected_Starting_incremental_compilation_6032'],
];

export class TypescriptConfig {
	protected currentLocale: Locales;
	protected messages: Map<SIGNAL_MESSAGE_ID, RegExp>;
	private englishMessage: {[id: string]: string};

	constructor() {
		this.messages = new Map;
		this.englishMessage = require(`typescript/lib/diagnosticMessages.generated.json`);
		this.setLocale('zh-CN');
	}

	setLocale(locale: Locales) {
		if (this.currentLocale !== locale) {
			this.currentLocale = locale;
			this.reloadErrors();
		}
	}

	get locale() {
		return this.currentLocale;
	}

	get localeArgument() {
		return ['--locale', this.currentLocale];
	}

	protected reloadErrors() {
		let messageData: any;
		if (this.currentLocale === 'en') {
			messageData = this.englishMessage;
		} else {
			messageData = require(`typescript/lib/${this.currentLocale.toLowerCase()}/diagnosticMessages.generated.json`);
		}
		this.messages.clear();
		for (const [type, messageId, ...replace] of signalMessageIds) {
			const message = messageData[messageId] || this.englishMessage[messageId];
			const messageParts = message.split(/{\d+}/g).map(e => escapeRegExp(e));
			const regParts: string[] = [];
			for (const item of replace) {
				regParts.push(messageParts.shift());
				regParts.push(item);
			}
			regParts.push(...messageParts);
			const regexp = new RegExp(regParts.join(''));
			console.log('signal of %s[%s]: %s', type, SIGNAL_MESSAGE_ID[type], regexp);
			this.messages.set(parseInt(type) as any, regexp);
		}
	}

	testLine(line: string): SIGNAL_MESSAGE_ID {
		for (const [type, matcher] of this.messages.entries()) {
			if (matcher.test(line)) {
				return type;
			}
		}
		return null;
	}
}

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}