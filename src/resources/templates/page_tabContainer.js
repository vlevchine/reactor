import PropTypes from 'prop-types';
import {
  useNavigate,
  useLocation,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { useAppContext } from '@app/contextProvider';
import TabList from '@app/components/tabList';
import '@app/content/styles.css';

//Tab container page
const T_Page = ({ def, className = '' }) => {
  const { id, items = [], label } = def,
    { cache } = useAppContext(),
    navigate = useNavigate(),
    loc = useLocation().pathname.split('/'),
    pageId = loc[loc.indexOf(id) + 1],
    to = cache.fetch({ key: id })?.tab || items[0].id,
    onTab = (tid) => {
      if (items.find((e) => e.id === tid)) {
        cache.save({ key: id, id: 'tab' }, tid);
        navigate(tid);
      }
    };
  return pageId ? (
    <div className={className}>
      <h4>{label}</h4>
      <TabList tabs={items} selected={pageId} update={onTab} />
      <Outlet />
    </div>
  ) : (
    <Navigate to={to} />
  );
};

T_Page.propTypes = {
  def: PropTypes.object,
  className: PropTypes.string,
};

export default T_Page;
