import { ProcessPool } from 'session-controller/process-pool.base';
import { SIGNAL_MESSAGE_ID, TypescriptConfig } from 'actions/typescriptConfigure';
import { ProcessState, ProcessStatus } from 'session-controller/process-state';
import { tscGlobalConfig } from 'actions/typescriptConfigureConfig';

export class TypescriptCompilerPool extends ProcessPool {
	constructor() {
		super();
	}

	start(tsconfigFile: string) {
		const tsconfig = require(tsconfigFile);
		const compilerOptions = tsconfig.compilerOptions || {};
		const tscCfg = new TypescriptConfig();
		tscCfg.setLocale(compilerOptions.locale || tscGlobalConfig.get('locale') || 'en');
		const process = this.spawnWorker({
			friendlyName     : tsconfigFile,
			detailInformation: 'xxxx',
		}, ['tsc', '-p', tsconfigFile, '-w', ...tscCfg.localeArgument]);

		const outHandle = (lineData) => {
			this.outputHandler(lineData.toString('utf8'), process, tscCfg);
		};
		process.stdout.on('data', outHandle);

		process.waitExit().then(() => {
			process.stdout.removeListener('data', outHandle);
		});
	}

	outputHandler(line: string, process: ProcessState, tscCfg: TypescriptConfig) {
		const messageType = tscCfg.testLine(line);
		if (!messageType) {
			return;
		}
		console.log('%s|%s|', SIGNAL_MESSAGE_ID[messageType], line);

		switch (messageType) {
			case SIGNAL_MESSAGE_ID.FILE_CHANGE:
				process.changeStatus(ProcessStatus.BUSY);
				break;
			case SIGNAL_MESSAGE_ID.ERROR_SINGLE:
			case SIGNAL_MESSAGE_ID.ERROR_MULTIPLE:
				process.changeStatus(ProcessStatus.ERROR);
				break;
			case SIGNAL_MESSAGE_ID.SUCCESS:
				process.changeStatus(ProcessStatus.IDLE);
				break;
		}
	}
}