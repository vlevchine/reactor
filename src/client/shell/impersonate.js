import { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Navigate } from 'react-router-dom';
import { _ } from '@app/helpers';
import { appState, toaster } from '@app/services';
import { useResources } from '@app/providers';
import { Alert, Button, Radio, Select } from '@app/components/core'; //, Select

Impersonate.propTypes = {
  config: PropTypes.object,
  ctx: PropTypes.object,
};
const sessionProps = ['user', 'company'];
export default function Impersonate({ config, ctx }) {
  const { loadAllUsers, impersonate } = useResources(), // resources
    { user, company } = ctx,
    companies = useRef([]),
    [selected, setSelected] = useState({}),
    co = companies.current.find((e) => e.id === selected.company),
    canImpersonate = true, // user?.isOwner(),
    { home } = config.staticPages,
    navigate = useNavigate(),
    onCompany = (company) => {
      const co = companies.current.find((e) => e.id === company);
      setSelected(co ? { company, user: co.users[0] } : {});
    },
    onUserSelected = (userId) => {
      setSelected({ ...selected, user: userId });
    },
    doImpersonate = useCallback(async (usr) => {
      const res = await impersonate({
          userId: usr?.user,
          companyId: usr?.company,
        }),
        { error, session } = res;
      if (error) navigate('error');
      appState.nav.clear();
      appState.auth.dispatch({
        path: 'session',
        value: _.pick(session, sessionProps),
      });
    }, []),
    impersonateUser = async () => {
      if (user?.id === selected.user) {
        toaster.info(
          `User ${user.name} is currently logged in`,
          true
        );
      } else doImpersonate(selected);
    };

  if (!canImpersonate)
    return <Navigate to={`/${home.path}`} replace />;

  useEffect(() => {
    loadAllUsers().then((data) => {
      companies.current = data;
      setSelected(
        user?.isImpersonating()
          ? { user: user.username, company: company.id }
          : { company: data[0].id, user: data[0].users[0].id }
      );
    });
  }, []);

  return user ? (
    <section className="app-content">
      <Alert
        type="info"
        style={{ width: '60%' }}
        text={
          <InfoPanel
            social={user?.logged?.socialName}
            user={user?.name}
            company={company?.name}
            isImpersonating={user?.isImpersonating()}
            cancel={doImpersonate}
          />
        }
      />
      <div className="flex-row" style={{ margin: '2rem 0 2rem 20%' }}>
        <h5>Select company:</h5>
        <Select
          options={companies.current}
          value={selected.company}
          onChange={onCompany}
          display="name"
          style={{ width: '16rem', margin: '0 0 0 2rem' }}
        />
      </div>
      <div className="flex-row" style={{ margin: '1rem 0 2rem 20%' }}>
        <h5 style={{ width: '10rem' }}>Select user:</h5>
        <Radio
          options={co?.users}
          value={selected.user}
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
        disabled={selected.user === user?.id}
      />
    </section>
  ) : (
    <div className="app-message">
      <h3>Loading company data from server, please wait...</h3>
    </div>
  );
}

InfoPanel.propTypes = {
  user: PropTypes.string,
  company: PropTypes.string,
  social: PropTypes.string,
  isImpersonating: PropTypes.bool,
  cancel: PropTypes.func,
};
function InfoPanel({
  user,
  company,
  isImpersonating,
  social,
  cancel,
}) {
  return (
    <div>
      <div>
        You are curreently logged in as &nbsp;
        <strong>
          <i>{social}</i>
        </strong>
        &nbsp;and
        <br />
        <b>
          {isImpersonating
            ? ` impersonated as ${user} associated with "${company}"".`
            : ' not impersonated.'}
        </b>
      </div>
      <div className="justaposed">
        To impersonate a user, please select a company and one of the
        following users to get appropriate access rights
        {user && (
          <Button
            text="Stop Impersonation"
            prepend="user"
            iconStyle="r"
            onClick={cancel}
            disabled={!isImpersonating}
            className="info invert md mt-4 align-center"
          />
        )}
      </div>
    </div>
  );
}
