export { default as Toaster, useToaster } from './toaster';
export { default as Dialog, useDialog } from './dialog';
export { default as store } from './store';
import { AUTH, NAV, SESSION } from '@app/constants';
import { getTopicService } from './store';

export const navState = getTopicService(NAV);
export const sessionState = getTopicService(SESSION);
export const authState = getTopicService(AUTH);
export const appState = {
  nav: navState,
  session: sessionState,
  auth: authState,
};
//import { initStore, clearStore, useStore } from './store';
