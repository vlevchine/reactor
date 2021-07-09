import { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Navigate } from 'react-router-dom';
import { _ } from '@app/helpers';
import { appState, useToaster } from '@app/services';
import { useResources } from '@app/providers';
import { Alert, Button, Radio, Select } from '@app/components/core';

function reducer(state, payload) {
  const res = { ...state },
    { companies, company, user } = payload;
  if (companies) res.companies = companies;
  if (company) {
    res.company = res.companies.find((c) => c.id === company);
  }
  if (!res.company) res.company = res.companies[0];
  if (res.company)
    res.user = user
      ? res.company.users.find((e) => e.id === user)
      : res.company.users[0];
  return _.isEquivalent(res, state) ? state : res;
}

Impersonate.propTypes = {
  config: PropTypes.object,
  dataProvider: PropTypes.object,
  resources: PropTypes.object,
  lookupsMng: PropTypes.object,
};

export default function Impersonate({ config }) {
  const { loadAllUsers, impersonate } = useResources(), // resources
    toaster = useToaster(),
    auth = appState.auth.get(),
    session = appState.session.get(),
    { app, home } = config.staticPages,
    navigate = useNavigate(),
    { loadCompanyData } = useResources(),
    [state, dispatch] = useReducer(reducer, {}),
    { company, companies, user } = state,
    onCompany = (company) => {
      dispatch({ company });
    },
    onUserSelected = (user) => {
      dispatch({ user });
    },
    impersonateUser = async () => {
      if (user?.id !== session.user?.id) {
        dispatch({ user: '_' });
        const res = await impersonate({
            userId: user.id,
            companyId: company.id,
          }),
          { error } = res;
        if (error) navigate('error');
        appState.session.clear();
        appState.nav.clear();
        appState.session.dispatch({
          value: { company, user },
        });
        const loaded = await loadCompanyData(company.id);
        if (loaded) {
          navigate(`/${app.path}`);
        } else dispatch({ user: user.id });
      } else toaster.info(`User ${user.name} is currently logged in`);
    };

  if (!auth.username)
    return <Navigate to={`/${home.path}`} replace />;

  useEffect(() => {
    loadAllUsers().then((d) => {
      dispatch({
        companies: d,
        company: session.company?.id,
      });
    });
  }, []);

  return user ? (
    <>
      <Alert
        type="info"
        text="To have a proper access rights, please select one of the
        following users you would like to impersonate:"
      />
      <div className="flex-row" style={{ margin: '2rem 0 2rem 30%' }}>
        <h5>Select company:</h5>
        <Select
          options={companies}
          value={company?.id}
          onChange={onCompany}
          display="name"
          style={{ width: '16rem', margin: '0 0 0 2rem' }}
        />
      </div>
      <div className="flex-row" style={{ margin: '0 0 2rem 30%' }}>
        <h5>Select user:</h5>
        <Radio
          options={company?.users}
          value={user?.id}
          onChange={onUserSelected}
          idProp="username"
          dataid="user"
          style={{ margin: '0 0 0 2rem' }}
          display={(e) => (
            <>
              <strong style={{ marginRight: '0.5rem' }}>
                {e.name}
              </strong>
              <i>{e.roles.join(', ')}</i>
            </>
          )}
        />
      </div>
      <Button
        text="Impersonate"
        prepend="user"
        iconStyle="r"
        onClick={impersonateUser}
        className="lg"
        style={{ alignSelf: 'center' }}
        disabled={!company} //|| user.username === userInSession}
      />
    </>
  ) : (
    <div className="app-message">
      <h3>Loading company data from server, please wait...</h3>
    </div>
  );
}
