import { IProcessExitFailed, IProcessExitSuccess, IProcessState } from 'session-controller/types';
import { ChildProcess, spawn } from 'child_process';
import { OutputCollector } from 'session-controller/output-collector';
import { Deferred } from 'jquery';
import { remote } from 'electron';
import split = require('split');

export class ProcessState implements IProcessState {
	private _exit: JQuery.Deferred<Readonly<IProcessExitSuccess | IProcessExitFailed>>;
	private _collect: JQuery.Deferred<void>;
	protected exited = false;
	public readonly process: ChildProcess;

	static Current: ProcessState;

	constructor(
		public readonly name: string,
		options,
		public readonly commandToRun: ReadonlyArray<string>,
		private _output: OutputCollector,
	) {
		this.process = spawn(remote.process.argv[0], remote.process.argv.slice(1), options);

		this._exit = Deferred();
		this._collect = Deferred();
	}

	public get stdout() {
		return this._output;
	}

	dispose() {
		this.exited = true;
		this.process.removeAllListeners();
		this.process.stdout.unpipe();
		this.process.stdout.removeAllListeners();
		this.process.stderr.unpipe();
		this.process.stderr.removeAllListeners();
	}

	reset() {
		this.dispose();
		this.exited = false;
		this.process.kill('sigint');

	}

	collect() {
		if (!this.exited) {
			this.process.kill('sigint');
		}
		this._collect.resolve();
	}

	attachHandlers() {
		const process = this.process;

		process.on('exit', (code: number, signal: string) => {
			this.dispose();
			const message = `process exit: code=${code}, signal=${signal}`;
			console.log(message);
			if (code !== 0) {
				this.stdout.realEnd('\x1B[1;38;5;9m' + message + '\x1B[0m');
			} else {
				this.stdout.realEnd('\x1B[1;38;5;10m' + message + '\x1B[0m');
			}

			this._exit.resolve(<IProcessExitSuccess>{
				code, signal,
			});
		});
		process.on('error', (error: Error) => {
			this.dispose();
			console.log('process error: %s', error);
			this.stdout.realEnd('\x1B[1;38;5;10mprocess exit with error: ' + error + '\x1B[0m');

			this._exit.resolve(<IProcessExitFailed>{
				error,
			});

			if (process.pid) {
				process.kill('sigkill');
			}
		});

		process.stdout.pipe(split()).pipe(this._output);
		process.stderr.pipe(split()).pipe(this._output);

		process.on('message', (data) => {
			if (!Array.isArray(data)) {
				return;
			}
			const [action,] = data;
			switch (action) {
				case 'init':
					process.send(['run', this.commandToRun]);
			}
		});
	}

	public activate(): PromiseLike<void> {
		ProcessState.Current = this;
		const p = this.stdout.activate();

		const reset = () => {
			if (ProcessState.Current === this) {
				ProcessState.Current = null;
			}
		};
		p.then(reset, reset);
		return p;
	}

	public waitExit(): PromiseLike<Readonly<IProcessExitSuccess | IProcessExitFailed>> {
		return this._exit.promise();
	}

	public waitCollect(): PromiseLike<void> {
		return this._collect.promise();
	}
}
