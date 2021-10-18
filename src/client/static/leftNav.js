import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames, authorized } from '@app/helpers';
import { appState } from '@app/services';
import { Accordion } from '@app/components/core';

LeftNav.propTypes = {
  config: PropTypes.object,
  onClick: PropTypes.func,
};
export default function LeftNav({ config, onClick }) {
  const { nav, session } = appState,
    { user } = session.get(),
    [collapsed, collapse] = useState(nav.get().sideCollapsed),
    menuGuarded = useMemo(() => filterMenu(config, user), [user]),
    // defPage = (config.routes, path, { exact: true }),, findInItems, collapse
    // selected = defPage ? findInItems(menuGuarded, defPage.key) : menuGuarded[0],
    onNav = (ev, key) => {
      ev.stopPropagation();
      onClick({ requestRoute: { key } });
    };

  useEffect(() => {
    const sub = nav.subscribe(({ leftNavToggle }) => {
      if (leftNavToggle) collapse((e) => !e);
    });
    return () => nav.unsubscribe(sub);
  }, []);

  return (
    <aside
      id="sidenav"
      className={classNames(['app-sidenav'], { collapsed })}>
      {collapsed ? (
        <div className="accordion">Menu</div>
      ) : (
        <Accordion
          items={menuGuarded}
          onSelect={onNav}
          //selected={selected?.key}
          spec={{ label: (t) => t.label }}
        />
      )}
    </aside>
  );
}

function filterMenu({ menu = [], guards }, user) {
  return user
    ? menu.reduce((acc, e) => {
        const pass = !e.noNav &&
          authorized(user, guards[e.key]) && { ...e };
        if (pass) {
          if (e.items) {
            pass.items = e.items.filter((t) => {
              const tabsAllow =
                !t.tabs ||
                t.tabs.filter((tb) => authorized(user, guards[tb]))
                  .length > 0;
              return tabsAllow && authorized(user, guards[t.key]);
            });
          }
          if (
            e.tabs &&
            !e.tabs.filter((tb) => authorized(user, guards[tb]))
              .length
          )
            pass.items = [];

          if (!pass.items || pass.items.length) acc.push(pass);
        }
        return acc;
      }, [])
    : [];
}
