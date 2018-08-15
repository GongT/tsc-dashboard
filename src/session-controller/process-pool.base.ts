import { SpawnOptions } from 'child_process';
import { StreamMultiplexer } from 'session-controller/output-multiplexer';
import { IProcessHandler, IProcessPoolHandler, IProcessPoolStarter } from 'session-controller/types';
import { ProcessState } from 'session-controller/process-state';
import { remote } from 'electron';

export abstract class ProcessPool implements IProcessPoolHandler, IProcessPoolStarter {
	public readonly output: StreamMultiplexer;
	protected callback: IProcessHandler;

	abstract start(...args: string[]): void;

	constructor() {
		this.output = new StreamMultiplexer();
		this.output.resume();
	}

	getCurrentProcess() {
		return ProcessState.Current;
	}

	handler(callback: IProcessHandler): void {
		if (this.callback) {
			throw new Error('Can not have multiple callback');
		}
		this.callback = callback;
	}

	protected spawnWorker(readName: string, commandToRun: ReadonlyArray<string>): void {
		const options: SpawnOptions = {
			env        : { ...remote.process.env, __TSDASHBOARD_CHILD: 'yes' },
			windowsHide: true,
			cwd        : remote.process.cwd(),
			stdio      : ['ignore', 'pipe', 'pipe', 'pipe', 'ipc'],
		};
		console.log('running:', remote.process.argv);

		const output = this.output.create();
		const state = new ProcessState(readName, options, commandToRun, output);

		console.log('spawned process [%s] as id %s', commandToRun.join(' '), state.process.pid);

		state.attachHandlers();

		this.callback(state).then(() => {

		}, (e) => {
			setImmediate(() => {
				throw e;
			});
		});
	}
}