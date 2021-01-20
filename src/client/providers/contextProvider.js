//App context - bundles all cross-app resources needed, i.e. translations, store, etc.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { AUTH, TOAST, SESSION, NAV } from '@app/constants';
import store from '@app/store/store';
import storage from '@app/store/storage';
import t from '@app/utils/i18';
import { Alert } from '@app/components/core';
import dataProvider from './dataProvider';
import openDB from './dbManager';
import { createResources, useResources } from './resourceManager';

const setMessage = (type, msg, err) => ({
    type: 'danger',
    message: `${msg}.${err ? ` Error: ${err}` : ''}`,
  }),
  info_style = { gridArea: '2/2/3/3' };
const styles = getComputedStyle(document.documentElement), //.;
  theme = [
    'success',
    'warning',
    'danger',
    'primary',
    'secondary',
    'info',
  ].reduce(
    (acc, e) => ({
      ...acc,
      [e]: styles.getPropertyValue(`--${e}`),
    }),
    {}
  );
const AppContext = createContext(),
  useAppContext = () => useContext(AppContext);

AppContextProvider.propTypes = {
  children: PropTypes.any,
  logger: PropTypes.object,
  config: PropTypes.object,
  types: PropTypes.object,
  queries: PropTypes.object,
  mutations: PropTypes.object,
  api_uri: PropTypes.string,
  gql: PropTypes.string,
};

export default function AppContextProvider(props) {
  const { config, types, children } = props,
    { id, clientDB } = config,
    { init, load, loadMore } = useMemo(() => {
      storage.init(id);
      store.init(storage);
      dataProvider.init(props);
      return createResources(types, dataProvider);
    }, []),
    [info, setInfo] = useState(() =>
      setMessage('info', 'Loading data. Please, wait...')
    ),
    notifier = useMemo(
      () => ({
        toast(pld) {
          store.command(TOAST, pld);
        },
        danger(text) {
          store.command(TOAST, { type: 'danger', text });
        },
        warning(text) {
          store.command(TOAST, { type: 'warning', text });
        },
        info(text) {
          store.command(TOAST, { type: 'info', text });
        },
        success(text) {
          store.command(TOAST, { type: 'success', text });
        },
      }),
      []
    ),
    loadSession = useCallback(async (user, company) => {
      const { locale, uom } = user;
      await store.dispatch({
        [SESSION]: { value: { user, company } },
        [NAV]: {
          value: { globals: { locale, uom } },
        },
      });
      const { error, lookups, users } = await dataProvider.fetch(
        'companyConfig'
      );
      if (!error) {
        loadMore(lookups);
        store.dispatch(SESSION, {
          value: { users },
        });
        return true;
      } else {
        notifier.danger('Error requesting company data');
        return false;
      }
    }, []),
    ctx = {
      store,
      pageContext: Object.create(null),
      dataProvider,
      useResources,
      loadSession,
      sharedData: Object.create(null),
      notifier,
      theme,
      t,
    };

  useEffect(async () => {
    const [conf, db] = await Promise.all([
      dataProvider.handshake(),
      openDB(clientDB.name),
    ]);

    if (db) {
      init(db);
      load(conf?.versions);
    }
    if (!conf) {
      notifier.warning(
        'Can not connect to server, please contact system administrator'
      );
    } else if (conf.error) {
      notifier.warning('No active session, please log-in');
    } else {
      const { user, company, ...value } = conf.session;
      store.dispatch(AUTH, { value });
      if (user && company) loadSession(user, company);
    }
    setInfo();
  }, []);

  return (
    <AppContext.Provider value={ctx}>
      {info ? (
        <Alert
          type={info.type}
          text={<h3>{info.message}</h3>}
          style={info_style}
        />
      ) : (
        children(store, notifier)
      )}
    </AppContext.Provider>
  );
}

export { AppContext, useAppContext };
