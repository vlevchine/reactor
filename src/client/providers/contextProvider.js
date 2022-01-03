//App context - bundles all cross-app resources needed, i.e. translations, store, etc.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import Icons from '@app/appData/fa-icons';
import { _ } from '@app/helpers';
import { appState, toaster } from '@app/services';
import t from '@app/utils/i18';
import { getUser } from '@app/utils/user';
import { Alert } from '@app/components/core';
//import { AppIcons } from '@app/components/core/icon';
import { setFormats } from '@app/utils/formatter';
import dataProvider from './dataProvider';
import { open } from '@app/services/indexedCache'; //, entityCacheclose
import { createResources } from './resourceManager';

const setMessage = (type, msg, err) => ({
    type: 'danger',
    message: `${msg}.${err ? ` Error: ${err}` : ''}`,
  }),
  msgLoading = setMessage(
    'info',
    'Loading data from server. Please, wait...'
  ),
  msgError = setMessage(
    'danger',
    'Error loading data from server. Please, contact your system administrator.'
  ),
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
  ),
  ctx = {
    pageContext: Object.create(null),
    dataProvider,
    sharedData: Object.create(null),
    theme,
    t,
    clear() {
      this.user = undefined;
      this.lookups = undefined;
      this.types = undefined;
      this.company = undefined;
      this.globals = undefined;
      this.users = undefined;
      this.roles = undefined;
    },
    updateUser(session) {
      const { id, settings, locale, uom } = session?.user || {};
      if (this.user?.id === id) return;
      this.user = getUser(session);
      this.globals = settings || { locale, uom };
      if (this.globals.locale) setFormats(this.globals);
    },
    updateCompany(data = {}) {
      const { company, lookups, types, users } = data;
      if (this.company?.id === company.id) return;
      this.company = company;
      this.company.allowedPages = company.features.pages.map((e) =>
        e.replace('.*', '')
      );
      this.users = users;
      this.lookups = lookups;
      this.types = types;
      //merge standard App roles defined in app.config,
      //company-specific roles defined in company record in DB
      //!!!TBD
      this.roles = company?.roles || [];
      return true;
    },
    update(data, session) {
      if (data.error) {
        toaster.danger('Error requesting company data');
        return false;
      }
      this.updateUser(session);
      this.updateCompany(data);
      return true;
    },
  };

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
    { clientDB } = config,
    { auth, nav } = appState,
    { loadCommonData, loadAppUserData } = useMemo(() => {
      return createResources(props);
    }, []),
    [info, setInfo] = useState(msgLoading),
    noSession = (data) => {
      const nosession = !data || data.code === 200;
      if (nosession) {
        toaster.warning('No active session, please log-in');
        setInfo(Symbol());
      }
      return nosession;
    },
    load = async (data) => {
      const { error, session = {} } = data || {};
      if (!data || error || !session?.user) {
        ctx.clear();
        nav.clear();
        auth.dispatch({
          path: 'session',
          value: {
            company: undefined,
            user: undefined,
          },
        });
        if (!noSession()) setInfo(msgError);
      } else {
        if (session.user?.id === ctx.user?.id) return;
        const dt = await loadAppUserData(
          session.user,
          session.company
        );
        ctx.update(dt, session);
        // const currentSession = appState.auth.get().session;
        //Auth keeps actual user via direct props and impersonated one via session prop
        // auth.dispatch({path: 'session',
        //   value: { session: { company: co, user } },
        // });
        setInfo(Symbol());
      }
    };

  useEffect(async () => {
    const [value] = await Promise.all([
      dataProvider.handshake(),
      open(clientDB.name),
    ]);
    await loadCommonData();
    //if (auth.get('session')) await
    if (!noSession(value)) await load(value);
    auth.dispatch({ value });
    const sub = auth.subscribe(load);
    return () => auth.unsubscribe(sub);
  }, []);

  return (
    <AppContext.Provider value={ctx}>
      <Icons />
      {_.isSymbol(info) ? (
        children(ctx)
      ) : (
        <Alert
          type={info.type}
          text={<h3>{info.message}</h3>}
          style={info_style}
        />
      )}
    </AppContext.Provider>
  );
}

export { AppContext, useAppContext };
