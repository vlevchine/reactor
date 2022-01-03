import PropTypes from 'prop-types';
import {
  useNavigate,
  useLocation,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { appState } from '@app/services';
import { TabStrip } from '@app/components/core';
import '@app/content/styles.css';

export const config = {};

First1.propTypes = {
  def: PropTypes.object,
  tabs: PropTypes.array,
  className: PropTypes.string,
};
export default function First1({ def, tabs = [], className = '' }) {
  const { id, title } = def,
    { nav } = appState,
    navigate = useNavigate(),
    loc = useLocation().pathname.split('/'),
    pageId = loc[loc.indexOf(id) + 1],
    onTab = (tid) => {
      if (tabs.find((e) => e.id === tid)) {
        nav.dispatch({ value: id, path: `${id}.tab` }, tid);
        navigate(tid);
      }
    };
  return pageId ? (
    <div className={className}>
      <h4>{title}</h4>
      <TabStrip tabs={tabs} selected={pageId} onSelect={onTab} />
      <Outlet />
    </div>
  ) : (
    <Navigate to={tabs[0].id} />
  );
}
