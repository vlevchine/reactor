// import { useState, useEffect, useMemo } from 'react';
// import PropTypes from 'prop-types';
// import { NAV } from '@app/constants';
// import { classNames, findInItems } from '@app/helpers';
// import { filterMenu } from './helpers';
// import { Accordion } from '@app/components/core';
// const Menu = () => <div>Menu</div>;

// SideNav.propTypes = {
//   store: PropTypes.object,
//   config: PropTypes.object,
//   user: PropTypes.object,
//   path: PropTypes.string,
//   onClick: PropTypes.func,
// };

// export default function SideNav({
//   path,
//   user,
//   config,
//   store,
//   onClick,
// }) {
//   const [collapsed, collapse] = useState(
//       () => store.getState(NAV).sideCollapsed
//     ),
//     { routes } = config,
//     menuGuarded = useMemo(() => filterMenu(config, user), [user]),
//     defPage = findInItems(routes, path, { exact: true }),
//     selected = defPage
//       ? findInItems(menuGuarded, defPage.key)
//       : menuGuarded[0],
//     onNav = (to) => {
//       const item = findInItems(menuGuarded, to);
//       item && onClick(item.path);
//     };

//   useEffect(() => {
//     const n_sub = store.subscribe(NAV, ({ sideCollapsed }) => {
//       if (sideCollapsed !== collapsed) collapse(sideCollapsed);
//     });
//     return () => store.unsubscribe(n_sub, NAV);
//   }, []);

//   return (
//     <aside
//       className={classNames(['app-sidenav'], {
//         'sidenav-collapsed': collapsed,
//       })}>
//       {collapsed ? (
//         <Menu config={config} />
//       ) : (
//         <Accordion
//           items={menuGuarded}
//           onSelect={onNav}
//           expandAll
//           selected={selected?.key}
//           // className="lg-1"
//         />
//       )}
//     </aside>
//   );
// }
