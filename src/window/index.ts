import { initTerminal } from 'window/terminal';
import { handleResizeEvent } from 'window/handleResizeEvent';
import 'material-design-lite';
import { initSettingsPage } from 'actions/settingsSwitch';
import { ipcRenderer } from 'electron';
import { handleInitNewSession } from 'actions/newSession';
import { CHANNEL_READY } from 'ipc-channel';
import { TypescriptConfig } from 'actions/typescriptLocale';
import { TypescriptCompilerPool } from 'session-controller/process-pool.tsc';
import { initFrame } from 'window/process-gui';

const tscfg = new TypescriptConfig();
const processes = new TypescriptCompilerPool(tscfg);

handleResizeEvent(300);
initFrame(processes);
initTerminal(processes);
initSettingsPage();
handleInitNewSession(processes);

ipcRenderer.send(CHANNEL_READY, 'ready');