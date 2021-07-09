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
import { useToaster } from '@app/services';
import { appState } from '@app/services';
import t from '@app/utils/i18';
import { Alert } from '@app/components/core';
//import { AppIcons } from '@app/components/core/icon';
import { setFormats } from '@app/utils/formatter';
import dataProvider from './dataProvider';
import openDB from './dbManager';
import { createResources } from './resourceManager';

const devRoles = ['power', 'dev'],
  userExt = {
    inRole(role) {
      return this.roles.includes(role);
    },
    inRoles(roles) {
      return _.intersect(this.roles, roles);
    },
    isAdmin() {
      return this.inRole('admin');
    },
    isOwner() {
      return this.inRole('owner');
    },
    isDev() {
      return this.inRoles(devRoles);
    },
    authorized(guard) {
      if (!guard) return true;
      const { inRole = [], offRole } = guard;
      return offRole ? !this.inRoles(offRole) : this.inRoles(inRole);
    },
  },
  getUser = (usr) => Object.assign(usr, userExt);

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
  ),
  ctx = {
    pageContext: Object.create(null),
    dataProvider,
    sharedData: Object.create(null),
    theme,
    t,
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
    toaster = useToaster(),
    { loadCommonData, loadCompanyData } = useMemo(() => {
      return createResources(props);
    }, []),
    [info, setInfo] = useState(() =>
      setMessage('info', 'Loading data froim server. Please, wait...')
    ),
    load = async ({ error, session }) => {
      let res = false;
      if (!error && !session) {
        toaster.warning(
          'Can not connect to server, please contact system administrator'
        );
      } else if (error) {
        //session expired, clear all session/nav data
        appState.session.clear();
        appState.nav.clear();
        toaster.warning('No active session, please log-in');
      } else {
        await loadCommonData();
        const { company, ...value } = session;
        appState.auth.dispatch({ value });
        if (session.user) {
          const nav = appState.nav.get(),
            req = await loadCompanyData(company.id, session.user.id),
            { error, users, user } = req;

          if (!error) {
            appState.session.dispatch({
              value: {
                company,
                user,
                users,
                roles: [...config.roles, ...req.company?.roles],
              },
            });
            if (user.settings)
              appState.nav.dispatch({
                path: 'globals',
                value: user.settings,
              });
            setFormats(nav.globals);
            //merge standard App roles defined in app.config,
            //company-specific roles defined in company record in DB
            ctx.user = getUser(user);

            res = true;
          } else toaster.danger('Error requesting company data');
        }
      }
      return res;
    };

  useEffect(async () => {
    Promise.all([
      dataProvider.handshake(),
      openDB(clientDB.name), //, db
    ]).then(async ([conf]) => {
      await load(conf);
      setInfo();
    });
  }, []);

  return (
    <AppContext.Provider value={ctx}>
       <Icons /> 
      {info ? (
        <Alert
          type={info.type}
          text={<h3>{info.message}</h3>}
          style={info_style}
        />
      ) : (
        children()
      )}
    </AppContext.Provider>
  );
}

export { AppContext, useAppContext };
