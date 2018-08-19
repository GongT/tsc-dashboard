import ElectronStore = require('electron-store');
import { ForEach } from 'window/terminal.config';

export const typescriptCompilerLocales = {
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

export type Locales = keyof typeof typescriptCompilerLocales;

interface TSCConfig {
	locale: Locales;
}

const defaultConfig: TSCConfig = {
	locale: 'en',
};
Object.freeze(defaultConfig);

export const tscConfigKeys = Object.keys(defaultConfig);
export const tscGlobalConfig: ElectronStore<TSCConfig> & ForEach<TSCConfig> = Object.assign(
	new ElectronStore<TSCConfig>({ name: 'tsc', defaults: defaultConfig }),
	{
		forEach(cb) {
			for (const k of tscConfigKeys) {
				cb(tscGlobalConfig.get(k), k);
			}
		},
	},
);

tscGlobalConfig.set(defaultConfig);