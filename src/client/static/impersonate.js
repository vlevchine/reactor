import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@app/providers/contextProvider';
import { AUTH } from '@app/constants';
import { _ } from '@app/helpers';
import { Alert, Button, Radio } from '@app/components/core';

const { pick } = _;
const request = {
  name: 'users',
  fields: 'id name roles',
};
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
  const { dataProvider } = useAppContext(), // resources
    roles = Object.fromEntries(
      config.roles.map((r) => [r.id, r.name])
    ),
    auth = store.getState(AUTH),
    username = auth.user?.username,
    navigate = useNavigate(),
    [ready, setReady] = useState(true),
    [user, setUser] = useState(
      () => users.find((e) => e.username === username) || users[0]
    ),
    onUserSelected = (usr) => {
      setUser(users.find((e) => e.username === usr));
    },
    impersonate = async () => {
      const value = await dataProvider.impersonate({
        username: user.username,
        company: companyId,
      });
      //for a new user -clear NAV and rest globals per user prefs
      await store.dispatch({
        AUTH: { value },
        NAV: {
          value: {
            globals: pick(value.user, ['lang', 'uom']),
          },
        },
      });
      setReady(false);
      await Promise.all([
        dataProvider.query(request),
        // resources.Lookups.loadMore(companyId),
      ])
        .then(([data]) => {
          store.dispatch(AUTH, {
            path: 'company',
            value: data,
          });
          navigate('/app');
        })
        .catch((err) => {
          const error = {
            err: pick(err, ['message', 'code']),
            message: 'Impersonation error',
          };
          navigate('/error', {
            state: { ...error, path: '/impersonate' },
          });
        });
    };

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
        style={{ margin: '2rem 0' }}
      />
      <Button
        text="Impersonate"
        icon="user"
        iconStyle="r"
        onClick={impersonate}
        className="lg-1"
        disabled={user.username === username}
      />
    </>
  ) : (
    <div className="app-message">
      <h3>Loading company data from server, please wait...</h3>
    </div>
  );
}
