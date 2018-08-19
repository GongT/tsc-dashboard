import { IProcessExitFailed, IProcessExitSuccess, IProcessState, OnStateChange } from 'session-controller/types';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { OutputCollector } from 'session-controller/output-collector';
import { Deferred } from 'jquery';
import { remote } from 'electron';
import { EventEmitter } from 'events';
import split = require('split');

export enum ProcessStatus {
	IDLE,
	BUSY,
	ERROR,
}

export enum ProcessEvent {
	RESTART,
}

export interface EventCallback {
	(event: ProcessEvent, ...args: any[]): void
}

export interface CustomDisplayOptions {
	friendlyName: string;
	detailInformation: string;
}

export class ProcessState implements IProcessState {
	private _exit: JQuery.Deferred<Readonly<IProcessExitSuccess | IProcessExitFailed>>;
	private _collect: JQuery.Deferred<void>;
	protected exited = false;
	private _process: ChildProcess;
	public readonly detail: string;
	public readonly name: string;

	protected _onStateChange = new EventEmitter();

	static Current: ProcessState;

	constructor(
		protected displayConfig: CustomDisplayOptions,
		protected readonly options: SpawnOptions,
		public readonly commandToRun: ReadonlyArray<string>,
		private _output: OutputCollector,
		private readonly _eventHandler: EventCallback,
	) {
		this.name = displayConfig.friendlyName || commandToRun.join('\n');
		this.detail = displayConfig.detailInformation + '\n\n' + commandToRun.join('\n');

		this._exit = Deferred();
		this._collect = Deferred();

	}

	public get process() {
		return this._process;
	}

	public get stdout() {
		return this._output;
	}

	dispose() {
		this.exited = true;
		this._process.removeAllListeners();
		this._process.stdout.unpipe();
		this._process.stdout.removeAllListeners();
		this._process.stderr.unpipe();
		this._process.stderr.removeAllListeners();
	}

	reset() {
		if (this.exited) {
			// already finished object.
			this.collect();
			this._eventHandler(ProcessEvent.RESTART, this.displayConfig, this.commandToRun);
		}
		this.dispose();
		this.exited = false;
		this._process.kill('sigint');
		this.attachHandlers();
	}

	exitOrCollect() {
		if (this.exited) {
			this.collect();
		} else {
			this._process.kill('sigint');
		}
	}

	collect() {
		this._onStateChange.removeAllListeners();
		if (!this.exited) {
			this._process.kill('sigint');
		}
		this._collect.resolve();
	}

	attachHandlers() {
		const process = this._process = spawn(remote.process.argv[0], remote.process.argv.slice(1), this.options);

		console.log('spawned process [%s] as id %s', this.commandToRun.join(' '), process.pid);

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

	private lastState;

	private _changeStatus(newState: ProcessStatus) {
		if (this.lastState !== newState) {
			this.lastState = newState;
			this._onStateChange.emit('-', newState, this);
		}
	}

	public onStateChange(cb: OnStateChange) {
		this._onStateChange.on('-', cb);
	}

	public changeStatus(newState: ProcessStatus) {
		if (!this.exited) {
			this._changeStatus(newState);
		}
	}
}
