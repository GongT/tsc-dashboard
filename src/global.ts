import { TypescriptCompilerPool } from 'session-controller/process-pool.tsc';
import { TypescriptConfig } from 'actions/typescriptLocale';

const tscfg = new TypescriptConfig();
export const processes = new TypescriptCompilerPool(tscfg);
