import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Outlet, Navigate } from 'react-router-dom';
import { SESSION, NAV } from '@app/constants';
import { useAppContext } from '@app/providers/contextProvider';
import { Radio } from '@app/components/core';
import { usePageEnter, authorized } from './helpers';

//Tab container page
const TabbedPage = ({ def, guards, root }) => {
  const { key, id, items = [] } = def,
    { store } = useAppContext(),
    pageId = usePageEnter(def, root, store),
    nav = store.getState(NAV),
    { user } = store.getState(SESSION),
    navigate = useNavigate(),
    tabs = useMemo(
      () => items.filter(({ key }) => authorized(user, guards[key])),
      [user]
    ),
    defTo = nav[key] || tabs[0].id,
    onTab = (tid) => {
      if (tabs.find((e) => e.id === tid)) {
        navigate(tid);
      }
    };

  return pageId ? (
    <>
      <nav role="tabpanel" style={{ margin: '1rem 0 0 0.5rem' }}>
        <Radio
          id={id}
          groupOf="tabs"
          horizontal
          display="name"
          options={tabs}
          style={{ fontSize: '1.1em' }}
          value={pageId}
          onChange={onTab}
        />
      </nav>
      <Outlet />
    </>
  ) : (
    <Navigate to={defTo} replace />
  );
};

TabbedPage.propTypes = {
  def: PropTypes.object,
  guards: PropTypes.object,
  root: PropTypes.string,
};

export default TabbedPage;
