import { ProcessPool } from 'session-controller/process-pool.base';
import { TypescriptConfig } from 'actions/typescriptLocale';

export class TypescriptCompilerPool extends ProcessPool {
	constructor(public readonly tscfg: TypescriptConfig) {
		super();
	}

	start(tsconfigFile: string) {
		this.spawnWorker(tsconfigFile, ['tsc', '-p', tsconfigFile, '-w', ...this.tscfg.localeArgument]);
	}
}