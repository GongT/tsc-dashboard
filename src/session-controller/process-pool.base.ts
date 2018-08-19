import { SpawnOptions } from 'child_process';
import { StreamMultiplexer } from 'session-controller/output-multiplexer';
import { IProcessHandler, IProcessPoolHandler, IProcessPoolStarter, IProcessState } from 'session-controller/types';
import { CustomDisplayOptions, ProcessEvent, ProcessState } from 'session-controller/process-state';
import { remote } from 'electron';

export abstract class ProcessPool implements IProcessPoolHandler, IProcessPoolStarter {
	public readonly output: StreamMultiplexer;
	protected callback: IProcessHandler;

	abstract start(...args: string[]): void;

	constructor() {
		this.output = new StreamMultiplexer();
		this.output.resume();
		this.handleEvent = this.handleEvent.bind(this);
	}

	private handleEvent(event: ProcessEvent, ...args: any[]): void {
		switch (event) {
			case ProcessEvent.RESTART:
				(this.spawnWorker as any)(...args);
				break;
			default:
				this._handleEvent(event, ...args);
		}
	}

	handler(callback: IProcessHandler): void {
		if (this.callback) {
			throw new Error('Can not have multiple callback');
		}
		this.callback = callback;
	}

	protected spawnWorker(display: CustomDisplayOptions, commandToRun: ReadonlyArray<string>) {
		const options: SpawnOptions = {
			env        : { ...remote.process.env, __TSDASHBOARD_CHILD: 'yes' },
			windowsHide: true,
			cwd        : remote.process.cwd(),
			stdio      : ['ignore', 'pipe', 'pipe', 'pipe', 'ipc'],
		};
		console.log('running:', remote.process.argv);

		const output = this.output.create();
		const state = new ProcessState(display, options, commandToRun, output, this.handleEvent);
		state.attachHandlers();

		setImmediate(() => {
			this.callback(state).then(() => {
				if (state === this.getCurrentProcess()) {
					this.output.pipeFrom(null);
				}
			}, (e) => {
				setImmediate(() => {
					throw e;
				});
			});
		});

		return state;
	}

	protected _handleEvent(event: ProcessEvent, ...args: any[]) {
		// for overwrite
	}

	getCurrentProcess(): IProcessState {
		return ProcessState.Current;
	}
}