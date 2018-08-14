import { ProcessPool } from 'session-controller/process-pool.base';
import { TypescriptConfig } from 'actions/typescriptLocale';
import { tmpdir } from 'os';

export class TypescriptCompilerPool extends ProcessPool {
	constructor(protected readonly tscfg: TypescriptConfig) {
		super();
	}

	start(tsconfigFile: string) {
		this.spawn(tsconfigFile, process.argv0, ['--project', tsconfigFile, ...this.tscfg.localeArgument], {
			env        : { __TSDASHBOARD_CHILD: 'yes' },
			windowsHide: true,
			cwd        : tmpdir(),
		});
	}
}