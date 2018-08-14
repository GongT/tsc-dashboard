import { OutputCollector } from 'session-controller/output-collector';
import { Transform, TransformCallback } from 'stream';
import { IOutputMultiplexer } from 'session-controller/types';
import split = require('split');

class Logger extends Transform {
	_transform(chunk: any, encoding: string, callback: TransformCallback): void {
		console.log('->', chunk.toString());
		callback(null, chunk);
	}
}

export class StreamMultiplexer extends Transform implements IOutputMultiplexer {
	protected guid = 0;
	protected current: OutputCollector;

	_transform(chunk: Buffer, encoding: string, callback: TransformCallback): void {
		this.push(chunk, encoding);
		callback(null, chunk);
	}

	end(...args) {
		console.log('one source end');
		if (this.current) {
			this.current.unpipe();
		}
	}

	realEnd(cb?: () => void) {
		super.end(cb);
	}

	create(): OutputCollector {
		const ret = new Logger;
		const output = new OutputCollector(this, ret);
		ret.pipe(split()).pipe(output);

		return output;
	}

	switchTo(target: OutputCollector | null) {
		if (this.current) {
			this.current.unpipe();
		}
		if (target) {
			this.current = target;
			this.push(target.scrollBack, 'utf8');
			this.pipe(target);
		} else {
			this.current = null;
		}
	}
}