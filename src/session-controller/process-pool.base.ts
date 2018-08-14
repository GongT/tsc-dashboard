import { spawn, SpawnOptions } from 'child_process';
import { StreamMultiplexer } from 'session-controller/output-multiplexer';
import { IProcessData, IProcessHandler, IProcessPoolHandler, IProcessPoolStarter } from 'session-controller/types';
import { ProcessState } from 'session-controller/process-state';

export abstract class ProcessPool implements IProcessPoolHandler, IProcessPoolStarter {
	public readonly output: StreamMultiplexer;
	protected callback: IProcessHandler;

	abstract start(...args: string[]): void;

	constructor() {
		this.output = new StreamMultiplexer();
	}

	handler(callback: IProcessHandler): void {
		if (this.handler) {
			throw new Error('Can not have multiple callback');
		}
		this.callback = callback;
	}

	protected spawn(readName: string, command: string, args?: ReadonlyArray<string>, options?: SpawnOptions): void {
		const process = spawn(command, args, {
			...options,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		const state = new ProcessState(readName, process, this.output.create());

		console.log('spawned process [%s %s] as id %s', command, args.join(' '), process.pid);

		state.attachHandlers();

		this.callback(state).then(() => {

		}, () => {

		});
	}

	protected activate()
}