import { OutputCollector } from 'session-controller/output-collector';
import { Transform, TransformCallback, TransformOptions } from 'stream';
import { IOutputMultiplexer } from 'session-controller/types';
import { Deferred } from 'jquery';

export class StreamMultiplexer extends Transform implements IOutputMultiplexer {
	protected guid = 0;
	protected current: OutputCollector;
	protected lastDeferred: JQuery.Deferred<void>;

	constructor(opts?: TransformOptions) {
		super(opts);
		this.resume();
	}

	_transform(chunk: Buffer, encoding: string, callback: TransformCallback): void {
		callback(null, chunk);
	}

	end(...args) {
		if (this.current) {
			this.current.unpipe();
		}
	}

	create(): OutputCollector {
		return new OutputCollector(this);
	}

	flush() {
		this.push('\x1Bc');
	}

	pipeFrom(target: null): void;
	pipeFrom(target: OutputCollector): PromiseLike<void>;
	pipeFrom(target: OutputCollector | null) {
		if (this.current === target) {
			return this.lastDeferred? this.lastDeferred.promise() : void 0;
		}
		if (this.current) {
			this.lastDeferred.resolve();
			this.current.unpipe(this);
			this.current.resume();
			this.current = null;
		}
		if (target) {
			this.lastDeferred = Deferred();
			this.push(target.scrollBack, 'utf8');
			if (!target.hasFinished()) {
				this.current = target;
				target.pipe(this);
			}
			return this.lastDeferred.promise();
		}
		return null;
	}
}