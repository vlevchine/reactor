//App context - bundles all cross-app resources needed, i.e. translations, store, etc.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { AUTH, SESSION, NAV } from '@app/constants';
import { useToaster, initStore } from '@app/services';
import store from '@app/store/store';
import cache from '@app/utils/storage';
import t from '@app/utils/i18';
import { Alert } from '@app/components/core';
import { AppIcons } from '@app/components/core/icon';
import { setFormats } from '@app/utils/formatter';
import dataProvider from './dataProvider';
import openDB from './dbManager';
import { createResources } from './resourceManager';

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
  api_uri: PropTypes.string,
  gql: PropTypes.string,
};
export default function AppContextProvider(props) {
  const { config, children } = props,
    { id, clientDB } = config,
    toaster = useToaster(),
    { load } = useMemo(() => {
      cache.init(id);
      store.init(cache);
      initStore(cache);
      dataProvider.init(props);
      return createResources(dataProvider);
    }, []),
    [info, setInfo] = useState(() =>
      setMessage('info', 'Loading data froim server. Please, wait...')
    ),
    loadData = async ({ error, session, versions }) => {
      let res = false;
      if (!error && !session) {
        toaster.warning(
          'Can not connect to server, please contact system administrator'
        );
      } else if (error) {
        //session expired, clear all session/nav data
        store.dispatch({
          [SESSION]: { value: undefined },
          [NAV]: { value: undefined },
        });
        toaster.warning('No active session, please log-in');
      } else {
        const { user, company, ...value } = session;
        store.dispatch(AUTH, { value });
        if (user && company) {
          const { locale, uom } = user,
            nav = store.getState(NAV);
          store.dispatch(SESSION, { value: { user, company } });
          if (!nav?.globals)
            store.dispatch(NAV, {
              path: 'globals',
              value: { locale, uom },
            });
          setFormats(nav.globals || user);
          const req = await dataProvider.fetch('companyConfig'),
            { error, lookups, users } = req;
          if (!error) {
            await load(versions, lookups);
            store.dispatch(SESSION, {
              value: { users },
            });
            res = true;
          } else {
            toaster.danger('Error requesting company data');
          }
        } else load(versions);
      }
      return res;
    },
    ctx = {
      store,
      pageContext: Object.create(null),
      dataProvider,
      loadData,
      sharedData: Object.create(null),
      theme,
      t,
    };

  useEffect(async () => {
    cache.set(true, ['lookups', 'roles'], {
      id: 'roles',
      _id: 'roles',
      value: config.roles,
    });
    Promise.all([
      dataProvider.handshake(),
      openDB(clientDB.name), //, db
    ]).then(async ([conf]) => {
      await loadData(conf);
      setInfo();
    });
  }, []);

  return (
    <AppContext.Provider value={ctx}>
      <AppIcons />
      {info ? (
        <Alert
          type={info.type}
          text={<h3>{info.message}</h3>}
          style={info_style}
        />
      ) : (
        children(store)
      )}
    </AppContext.Provider>
  );
}

export { AppContext, useAppContext };
