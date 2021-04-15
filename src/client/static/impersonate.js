import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Navigate } from 'react-router-dom';
import { useToaster } from '@app/services';
import { useAppContext } from '@app/providers/contextProvider';
import { AUTH, SESSION, NAV } from '@app/constants';
import { Alert, Button, Radio } from '@app/components/core';

//TBD - add other companies!!!!
import userData from '@app/appData/_users.json';
const { users } = userData,
  companyId = 'philo';

Impersonate.propTypes = {
  config: PropTypes.object,
  dataProvider: PropTypes.object,
  resources: PropTypes.object,
  store: PropTypes.object,
  lookupsMng: PropTypes.object,
};

export default function Impersonate({ config, store }) {
  const { dataProvider, loadData } = useAppContext(), // resources
    toaster = useToaster(),
    roles = Object.fromEntries(
      config.roles.map((r) => [r.id, r.name])
    ),
    auth = store.getState(AUTH),
    userInSession = store.getState(SESSION).user?.id,
    { app, home } = config.staticPages,
    navigate = useNavigate(),
    [ready, setReady] = useState(true),
    [user, setUser] = useState(
      () =>
        users.find((e) => e.username === userInSession) || users[0]
    ),
    onUserSelected = (usr) => {
      const sel = users.find((e) => e.username === usr);
      if (user === sel) {
        toaster.danger(`User ${user.name} is currently logged in`);
      } else setUser(sel);
    },
    impersonate = async () => {
      setReady(false);
      const res = await dataProvider.impersonate({
        userId: user.username,
        companyId,
      });
      store.dispatch({
        [SESSION]: { value: undefined },
        [NAV]: { value: undefined },
      });
      const loaded = await loadData(res);
      if (loaded) {
        navigate(`/${app.path}`);
      } else setReady(true);
    };

  if (!auth.username)
    return <Navigate to={`/${home.path}`} replace />;
  return ready ? (
    <>
      <Alert
        type="info"
        text="To have a proper access rights, please select one of the
        following users you would like to impersonate:"
      />
      <Radio
        options={users}
        value={user?.username}
        onChange={onUserSelected}
        idProp="username"
        dataid="user"
        display={(e) => (
          <>
            <strong style={{ marginRight: '0.5rem' }}>
              {e.name}
            </strong>
            <i>{e.roles.map((r) => roles[r]).join(', ')}</i>
          </>
        )}
        style={{ margin: '2rem 0', alignSelf: 'center' }}
      />
      <Button
        text="Impersonate"
        prepend="user"
        iconStyle="r"
        onClick={impersonate}
        className="lg-1"
        style={{ alignSelf: 'center' }}
        disabled={user.username === userInSession}
      />
    </>
  ) : (
    <div className="app-message">
      <h3>Loading company data from server, please wait...</h3>
    </div>
  );
}
