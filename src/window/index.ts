import { initTerminal } from 'window/terminal';
import { handleResizeEvent } from 'window/handleResizeEvent';
import 'material-design-lite';
import { initSettingsPage } from 'actions/settingsSwitch';
import { ipcRenderer } from 'electron';
import { handleInitNewSession } from 'actions/newSession';
import { CHANNEL_READY } from 'ipc-channel';
import { initFrame } from 'window/process-gui';

handleResizeEvent(300);
initFrame();
initTerminal();
initSettingsPage();
handleInitNewSession();

ipcRenderer.send(CHANNEL_READY, 'ready');