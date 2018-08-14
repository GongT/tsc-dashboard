import { Transform, TransformCallback } from 'stream';
import { StreamMultiplexer } from 'session-controller/output-multiplexer';

const eraseAll = Buffer.from([0x1B, 0x63]); // \ec

export class OutputCollector extends Transform {
	protected backLines: string[] = [];

	constructor(protected parent: StreamMultiplexer, protected readonly upstreamInput: NodeJS.WritableStream) {
		super();
	}

	pipeFrom(source: NodeJS.ReadableStream) {
		source.pipe(this.upstreamInput);
	}

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
		return this.backLines.join('\n'); // backLines always starts with \ec
	}

	activate() {
		this.parent.switchTo(this);
	}
}