/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { appState } from '@app/services';
import { MenuItemList, MenuTree } from '@app/components/core';

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
      select(key);
      onClick({ requestRoute: { key } });
    };

  useEffect(() => {
    const sub = nav.subscribe((data = {}) => {
      const { leftNavCollapse } = data;
      // if (!leftNavToggle) {currentPage,
      //   const item = _.getInItems(menu, currentPage);
      //   select(item?.key);
      // } else
      collapse(leftNavCollapse);
    });
    return () => nav.unsubscribe(sub);
  }, []);

  return (
    <aside
      tabIndex="0"
      className={classNames(['app-nav'], { min: collapsed })}>
      {collapsed ? (
        <MenuItemList
          items={menu}
          selected={selected}
          size="xxl"
          iconOnly
          onSelect={onNav}
        />
      ) : (
        <MenuTree
          items={menu}
          onSelect={onNav}
          selected={selected}
          display="label"
        />
      )}
    </aside>
  );
}
