const typescriptCompilerLocales = {
	'en'   : 'English (US)',
	'cs'   : 'Czech',
	'de'   : 'German',
	'es'   : 'Spanish',
	'fr'   : 'French',
	'it'   : 'Italian',
	'ja'   : 'Japanese',
	'ko'   : 'Korean',
	'pl'   : 'Polish',
	'pt-BR': 'Portuguese(Brazil)',
	'ru'   : 'Russian',
	'tr'   : 'Turkish',
	'zh-CN': 'Simplified Chinese',
	'zh-TW': 'Traditional Chinese',
};

type Locales = keyof typeof typescriptCompilerLocales;

export enum SIGNAL_MESSAGE_ID {
	ERROR_SINGLE = 1,
	ERROR_MULTIPLE,
	ERROR_CHANGE,
}

const signalMessageIds = {
	[SIGNAL_MESSAGE_ID.ERROR_SINGLE]  : 'Found_0_errors_Watching_for_file_changes_6194',
	[SIGNAL_MESSAGE_ID.ERROR_MULTIPLE]: 'Found_1_error_Watching_for_file_changes_6193',
	[SIGNAL_MESSAGE_ID.ERROR_CHANGE]  : 'File_change_detected_Starting_incremental_compilation_6032',
};

export class TypescriptConfig {
	protected currentLocale: Locales;
	protected messages: Map<SIGNAL_MESSAGE_ID, string>;

	constructor() {
		this.messages = new Map;
		this.setLocale('en');
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
			messageData = require(`typescript/lib/diagnosticMessages.generated.json`);
		} else {
			messageData = require(`typescript/lib/${this.currentLocale}/diagnosticMessages.generated.json`);
		}
		this.messages.clear();
		for (const [type, messageId] of Object.entries(signalMessageIds)) {
			this.messages.set(type as any, messageData[messageId]);
		}
	}
}
