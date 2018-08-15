import { Readable } from 'stream';

export interface IProcessState {
	readonly name: string;

	readonly stdout: Readable;

	activate(): PromiseLike<void>;

	waitExit(): PromiseLike<Readonly<IProcessExitSuccess | IProcessExitFailed>>;

	waitCollect(): PromiseLike<void>;
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