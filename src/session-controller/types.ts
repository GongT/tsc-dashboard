import { Readable } from 'stream';
import { ProcessStatus } from 'session-controller/process-state';

export interface OnStateChange {
	(newState: ProcessStatus, process: this): void;
}

export interface IProcessState {
	readonly name: string;
	readonly detail: string;

	readonly stdout: Readable;

	activate(): PromiseLike<void>;

	waitExit(): PromiseLike<Readonly<IProcessExitSuccess | IProcessExitFailed>>;

	waitCollect(): PromiseLike<void>;

	onStateChange(cb: OnStateChange): void;

	exitOrCollect(): void;

	reset(): void;
}

export interface IProcessExitSuccess {
	signal: string;
	code: number;
}

export interface IProcessExitFailed {
	error: Error;
}

export interface IProcessHandler {
	(process: Readonly<IProcessState>): Promise<void>
}

export interface IOutputMultiplexer extends NodeJS.WritableStream, NodeJS.ReadableStream {
}

export interface IProcessPoolStarter {
	start(...args: string[]): void;
}

export interface IProcessPoolHandler {
	readonly output: IOutputMultiplexer;

	handler(callback: IProcessHandler): void;
}