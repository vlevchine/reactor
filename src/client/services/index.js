export { default as Toaster, useToaster } from './toaster';
export { default as Dialog, useDialog } from './dialog';
export { default as AlertDialog } from './alertDialog';
export { default as store } from './store';
import { AUTH, NAV, SESSION } from '@app/constants';
import { getTopicService } from './store';
export { useData } from '@app/providers/resourceManager';
export { toaster } from './toast.js';

export const navState = getTopicService(NAV);
export const sessionState = getTopicService(SESSION);
export const authState = getTopicService(AUTH);
//TBD!!!
authState.isHost = () => true;
export const appState = {
  nav: navState,
  session: sessionState,
  auth: authState,
};
//import { initStore, clearStore, useStore } from './store';
