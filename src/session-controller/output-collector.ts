import { Transform, TransformCallback } from 'stream';
import { StreamMultiplexer } from 'session-controller/output-multiplexer';

const eraseAll = Buffer.from([0x1B, 0x63]); // \ec

export class OutputCollector extends Transform {
	protected backLines: string[] = [];
	protected finished: boolean;

	constructor(protected parent: StreamMultiplexer) {
		super();
		this.resume();
	}

	end(cb?: () => void): void;
	end(chunk: any, cb?: () => void): void;
	end(chunk: any, encoding?: string, cb?: () => void): void;
	end(cb, ...args) {
		if (arguments.length === 0) {
			return;
		} else if (typeof cb === 'function') {
			cb();
		} else {
			this.write(cb, ...args);
		}
	}

	realEnd(...args) {
		const ret = super.end(...args);
		this.finished = true;
		return ret;
	}

	emit(e: string, ...args: any[]) {
		const ret = super.emit(e, ...args);
		if (e === 'end') {
			this.finished = true;
		}
		return ret;
	}

	hasFinished() {
		return this.finished;
	}

	/** emitting buffer, becouse transform stream do not have object mode option */
	_transform(chunk: Buffer, encoding: string, callback: TransformCallback): void {
		if (!encoding || encoding === 'buffer') {
			encoding = 'utf8';
		}
		const found = chunk.lastIndexOf(eraseAll);
		if (found === -1) {
			if (this.backLines.length === 0) {
				this.backLines.push(eraseAll.toString());
			}
			this.backLines.push(chunk.toString(encoding));
			if (this.backLines.length > 1000) {
				this.backLines.shift();
			}
			callback(null, chunk);
		} else {
			this.backLines.length = 0;
			const sub = chunk.slice(found);
			this.backLines.push(sub.toString(encoding));
			callback(null, sub);
		}
	}

	get scrollBack() {
		return this.backLines.join('\r\n') + '\r\n'; // backLines always starts with \ec
	}

	activate() {
		return this.parent.pipeFrom(this);
	}
}