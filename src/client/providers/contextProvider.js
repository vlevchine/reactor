//App context - bundles all cross-app resources needed, i.e. translations, store, etc.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { AUTH, SESSION } from '@app/constants';
import { useSocialLogin } from '@app/shell/social';
import store from '@app/store/store';
import storage from '@app/store/storage';
import t from '@app/utils/i18';
import { Alert } from '@app/components/core';
import dataProvider from './dataProvider';
import openDB from './dbManager';
import { createResources, useResources } from './resourceManager';
//import notifier from '@app/shell/notifications';

//TBD!!!
const notifier = {};
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
};

export default function AppContextProvider({
  config,
  types,
  queries,
  mutations,
  api_uri,
  children,
}) {
  const { id, clientDB } = config,
    { init, load } = useMemo(() => {
      storage.init(id);
      store.init(storage);
      dataProvider.init(api_uri, queries, mutations);
      return createResources(types, dataProvider);
    }, []),
    { username } = store.getState(SESSION),
    [info, setInfo] = useState(
      () =>
        username &&
        setMessage('info', 'Loading data. Please, wait...')
    ),
    ctx = {
      store,
      pageContext: Object.create(null),
      dataProvider,
      useResources,
      sharedData: Object.create(null),
      notifier,
      theme,
      t,
    },
    onSuccess = async ({ token, provider }) => {
      const { error, versions, ...value } = await dataProvider.login({
        token,
        provider,
        username,
      });

      load(versions);
      if (error) {
        store.dispatch(SESSION);
      } else store.dispatch(AUTH, { value });
      setInfo();
    },
    onError = (err) => {
      setInfo(
        setMessage(
          'danger',
          'Failure logging in with social provider. Application can not be started!',
          err
        )
      ); //"popup_blocked_by_browser"
    };

  useEffect(async () => {
    const db = await openDB(clientDB.name);
    init(db);
  }, []);

  useSocialLogin(
    process.env.GOOGLE_ID,
    !!username,
    onSuccess,
    onError
  );

  return (
    <AppContext.Provider value={ctx}>
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
