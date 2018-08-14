import BrowserWindow = Electron.BrowserWindow;
import { appReady } from 'electron-util';

export class WindowCreator {
	private win: BrowserWindow;

	private resolve: (data: BrowserWindow) => void;
	private reject: (e: any) => void;
	private p: Promise<BrowserWindow>;

	constructor(private builder: () => Promise<BrowserWindow>) {
		this.p = new Promise<BrowserWindow>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	async loadApplication() {
		if (this.win) {
			return;
		}
		await appReady;
		try {
			this.win = await this.builder();
			console.log('\x1B[38;5;10mMain Window Created.\x1B[0m');
			this.resolve(this.win);
		} catch (e) {
			console.log('\x1B[38;5;9mMain Window Creation Failed: %s.\x1B[0m', e.message);
			this.reject(e);
		}
	}

	get window(): BrowserWindow {
		if (!this.win) {
			throw new Error('window is not loaded.');
		}
		return this.win;
	}

	wait() {
		return this.p;
	}
}