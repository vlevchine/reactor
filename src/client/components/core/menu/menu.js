/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { getIcon } from '@app/components/core'; // I,
import {
  mergeIds,
  useCollapsible,
} from '@app/components/core/helpers';
import { dropdownCloseRequest } from '../helpers';

function findById(id, items) {
  return _.getIn(items, _.insertBetween(id, 'items'));
}

Menu.propTypes = {
  id: PropTypes.string,
  items: PropTypes.array,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  withLabel: PropTypes.bool,
  nonExpandable: PropTypes.bool,
  submenu: PropTypes.bool,
  className: PropTypes.string,
  itemClass: PropTypes.func,
};
function render(e, display) {
  return _.isFunction(display) ? display(e) : e[display] || e.label;
}
export function Menu({
  id,
  items,
  display,
  withLabel,
  nonExpandable,
  submenu,
  className,
  itemClass,
}) {
  return items ? (
    <ul
      role="menu"
      className={classNames(['menu', className], { right: submenu })}
      data-collapse={submenu}>
      {items.map((e) => {
        const _id = mergeIds(id, e.id),
          hasChildren = !nonExpandable && e.items;
        return (
          <li key={e.id} role="menuitem">
            <span
              id={_id}
              role="button"
              tabIndex="0"
              data-prepend={getIcon(e.icon)}
              // data-prepend-s
              data-append={
                hasChildren
                  ? getIcon('angle-double-right')
                  : undefined
              }
              className={classNames([
                'minimal text-dots',
                itemClass?.(e),
              ])}>
              {withLabel && render(e, display)}
            </span>
            <Menu
              id={_id}
              submenu
              items={e.items}
              withLabel={withLabel}
            />
          </li>
        );
      })}
    </ul>
  ) : null;
}
MenuItem.propTypes = {
  id: PropTypes.string,
  items: PropTypes.array,
  icon: PropTypes.string,
  label: PropTypes.string,
  openDown: PropTypes.bool,
  onClick: PropTypes.func,
  onSelect: PropTypes.func,
  active: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
};
const animate = { duration: 200 };
export function MenuItem({
  id,
  icon,
  label,
  items,
  openDown,
  active,
  size,
  onClick,
  onSelect,
  className,
}) {
  const clicked = (ev, dt) => {
      const { target } = ev,
        _id = target?.id || target?.parentNode.id;
      console.log('inner click', ev, dt);
      dropdownCloseRequest(id);
      _id && onClick?.([id, _id].join('.'));
    },
    ref = items
      ? useCollapsible({ animate, onClick: clicked }, id)
      : useRef();

  return (
    <div
      ref={ref}
      className={classNames(['menu-unit', className], {
        'dir-down': openDown,
      })}>
      <button
        id={id}
        data-collapse-trigger
        data-prepend={getIcon(icon)}
        className={classNames(['minimal', size], {
          show: active === id,
        })}
        onClick={onSelect}>
        {label}
      </button>
      <div role="button" tabIndex="0" data-collapse className="right">
        <Menu items={items} withLabel />
      </div>
    </div>
  );
}
MenuItemList.propTypes = {
  items: PropTypes.array,
  iconOnly: PropTypes.bool,
  style: PropTypes.object,
  row: PropTypes.bool,
  openDown: PropTypes.bool,
  size: PropTypes.string,
  className: PropTypes.string,
  selected: PropTypes.string,
  onSelect: PropTypes.func,
};

export function MenuItemList({
  items,
  iconOnly,
  row,
  openDown,
  size,
  className,
  style,
  onSelect,
  selected,
}) {
  const clicked = (id) => {
    const item = findById(id, items);
    if (item && !item.items) onSelect?.(item.key);
  };

  return (
    <nav
      className={classNames([
        `flex-${row ? 'row' : 'column'} menu-item-list`,
        'align-center',
        className,
      ])}
      style={style}>
      {items.map((e) => (
        <MenuItem
          key={e.id}
          id={e.id}
          items={e.items}
          icon={e.icon}
          openDown={openDown}
          label={iconOnly ? undefined : e.label}
          onClick={clicked}
          size={size}
          className={classNames([className], {
            selected: selected?.startsWith(e.id),
          })}
        />
      ))}
    </nav>
  );
}
