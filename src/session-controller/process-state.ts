import { IProcessExitFailed, IProcessExitSuccess, IProcessState } from 'session-controller/types';
import { ChildProcess } from 'child_process';
import { OutputCollector } from 'session-controller/output-collector';

export class ProcessState implements IProcessState {
	constructor(
		public readonly name: string,
		public readonly process: ChildProcess,
		public readonly stdout: OutputCollector,
	) {
	}

	dispose() {
		this.process.removeAllListeners();
		this.process.stdout.unpipe();
		this.process.stdout.removeAllListeners();
		this.process.stderr.unpipe();
		this.process.stderr.removeAllListeners();
	}

	collect() {

	}

	attachHandlers() {
		const process = this.process;

		this.stdout.pipeFrom(process.stdout);
		this.stdout.pipeFrom(process.stderr);

		this._exit = new Promise((resolve) => {
		});
		this._collect = new Promise((resolve) => {
		});
		process.on('exit', (code: number, signal: string) => {
			this.dispose();
			console.log('process exit: code=%s, signal=%s', code, signal);

			this._exit.code = code;
			this._exit.signal = signal;
		});
		process.on('error', (error: Error) => {
			this.dispose();
			console.log('process error: %s', error);

			this._exit.error = error;

			if (process.pid) {
				process.kill('sigkill');
			}
		});
	}

	public activate(): void {
		this.stdout.activate();
	}

	public waitExit(): Promise<Readonly<IProcessExitSuccess | IProcessExitFailed>> {
		return undefined;
	}

	public waitCollect(): Promise<void> {
		return undefined;
	}
}
