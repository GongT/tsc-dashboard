export interface IProcessState {
	readonly name: string;

	activate(): void;

	waitExit(): Promise<Readonly<IProcessExitSuccess | IProcessExitFailed>>;

	waitCollect(): Promise<void>;
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