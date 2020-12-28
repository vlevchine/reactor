import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import TabList from '@app/components/tabList';
import '@app/pages/styles.css';

//Display/edit item details - <First1>
const T_Page = ({ def, className = '' }) => {
  const { items = [], path, label } = def,
    navigate = useNavigate(),
    loc = useLocation().pathname.split('/'),
    pageId = loc[loc.indexOf(path) + 1],
    onTab = (id) => {
      const item = items.find((e) => e.id === id);
      navigate(item.id);
    };
  return (
    <div className={className}>
      <h4>{label}</h4>
      <TabList tabs={items} selected={pageId} update={onTab} />
      <Outlet />
    </div>
  );
};

T_Page.propTypes = {
  def: PropTypes.object,
  className: PropTypes.string,
};

export default T_Page;
