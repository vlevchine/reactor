import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Outlet } from 'react-router-dom'; //, Navigate
import { appState } from '@app/services';
import { useAppContext } from '@app/providers';
import { TabStrip } from '@app/components/core';
import { Unauthorized } from '.';
// import { usePageEnter } from './helpers';

//Tab container page
const TabbedPage = ({ def, tabs, guards }) => {
  const { key } = def, //{  root }
    //   pageId = usePageEnter(def, root),
    { user, company } = useAppContext(),
    nav = appState.nav.get(),
    navigate = useNavigate(),
    _tabs = useMemo(
      () => tabs.filter(({ key }) => user.authorized(guards[key])),
      [user]
    ),
    onTab = (tid) => {
      console.log(tid);
      if (_tabs.find((e) => e.key === tid)) {
        navigate(tid);
      }
    };
  console.log(tabs, nav, company);

  return _tabs.length ? (
    <>
      <h4 className="mt-2 mb-2">{def.title}</h4>
      <TabStrip
        className="mt-4 ml-2"
        id={key}
        tabs={_tabs}
        display="title"
        value={key}
        onChange={onTab}
      />
      <Outlet />
    </>
  ) : (
    <Unauthorized />
  );
  //pageId ? (
  // ) : (
  //   <Navigate to={nav[key] || tabs?.[0].id} replace />
  // );
};

TabbedPage.propTypes = {
  tabs: PropTypes.array,
  def: PropTypes.object,
  guards: PropTypes.object,
  root: PropTypes.string,
};

export default TabbedPage;
