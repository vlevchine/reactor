import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { appState } from '@app/services';
import { Menu } from '@app/components/core';
import { MenuTree } from '@app/components';

LeftNav.propTypes = {
  menu: PropTypes.array,
  config: PropTypes.object,
  onClick: PropTypes.func,
};
export default function LeftNav({ menu, onClick }) {
  const { nav } = appState,
    navs = nav.get(),
    [collapsed, collapse] = useState(navs.sideCollapsed),
    [selected, select] = useState(navs.currentPage),
    //defPage ?  menuGuarded[0],
    onNav = (key) => {
      onClick({ requestRoute: { key } });
    };

  useEffect(() => {
    const sub = nav.subscribe((data = {}) => {
      const { currentPage, leftNavToggle } = data;
      if (!leftNavToggle) {
        const item = _.getInItems(menu, currentPage);
        select(item?.key);
      } else collapse((e) => !e);
    });
    return () => nav.unsubscribe(sub);
  }, []);

  return collapsed ? (
    <Menu
      className="fade-in"
      items={menu}
      size="xxl"
      iconOnly
      onSelect={onNav}
    />
  ) : (
    <MenuTree
      items={menu}
      className="fade-in"
      onSelect={onNav}
      selected={selected}
      display="label"
    />
  );
}
