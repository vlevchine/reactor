import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Outlet, Navigate } from 'react-router-dom';
import { appState } from '@app/services';
import { TabStrip } from '@app/components/core';
import { usePageEnter, authorized } from './helpers';

//Tab container page
const TabbedPage = ({ def, guards, root }) => {
  const { key, id, items = [] } = def,
    pageId = usePageEnter(def, root),
    nav = appState.nav.get(),
    { user } = appState.session.get(),
    navigate = useNavigate(),
    tabs = useMemo(
      () => items.filter(({ key }) => authorized(user, guards[key])),
      [user]
    ),
    onTab = (tid) => {
      if (tabs.find((e) => e.id === tid)) {
        navigate(tid);
      }
    };

  return pageId ? (
    <>
      <TabStrip
        style={{ margin: '1rem 0 0 0.5rem' }}
        id={id}
        tabs={tabs}
        value={pageId}
        onChange={onTab}
      />
      <Outlet />
    </>
  ) : (
    <Navigate to={nav[key] || tabs?.[0].id} replace />
  );
};

TabbedPage.propTypes = {
  def: PropTypes.object,
  guards: PropTypes.object,
  root: PropTypes.string,
};

export default TabbedPage;
