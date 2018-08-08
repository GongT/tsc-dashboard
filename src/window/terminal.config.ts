import ElectronStore = require('electron-store');
import { is } from 'electron-util';

interface TerminalConfig {
	fontFamily: string;
	bellStyle: null | 'none' | 'visual' | 'sound' | 'both';
	cursorStyle: null | 'block' | 'underline' | 'bar'
	cursorBlink: boolean;
	enableBold: boolean;
	fontSize: number;
	letterSpacing: number;
	lineHeight: number;
	tabStopWidth: number;
	scrollback: number;
}

const defaultConfig: TerminalConfig = {
	fontFamily: is.windows? 'consolas' : 'wenquanyi micro hei mono',
	bellStyle: 'both',
	cursorStyle: 'bar',
	cursorBlink: true,
	enableBold: true,
	fontSize: 16,
	letterSpacing: 0,
	lineHeight: 1.1,
	tabStopWidth: 1,
	scrollback: 10000,
};
Object.freeze(defaultConfig);

export interface ForEach<OBJ> {
	forEach(cb: <T extends keyof OBJ>(value: OBJ[T], key: T) => void)
}

export const terminalConfigKeys = Object.keys(defaultConfig);
export const terminalConfig: ElectronStore<TerminalConfig> & ForEach<TerminalConfig> = Object.assign(
	new ElectronStore<TerminalConfig>({ name: 'terminal', defaults: defaultConfig }),
	{
		forEach(cb) {
			for (const k of terminalConfigKeys) {
				cb(terminalConfig.get(k), k);
			}
		},
	},
);

terminalConfig.set(defaultConfig);