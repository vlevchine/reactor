/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { I, getIcon } from '@app/components/core';
import { useCollapsible } from '@app/components/core/helpers';

MenuGroup.propTypes = {
  item: PropTypes.object,
  display: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.string,
}; //
function MenuGroup({ item, display, selected, onClick }) {
  const ref = useCollapsible({
    animate: { duration: 400 },
    ignoreOutClick: true,
  });
  return (
    <div ref={ref} className="menu-group">
      <div
        id={item.key}
        role="button"
        tabIndex="-1"
        data-collapse-trigger
        className={classNames(
          ['menu-title flex-row cursor-pointer'],
          {
            active: selected === item.key,
          }
        )}
        onClick={onClick}>
        {item.icon && <I name={item.icon} />}
        {<span>{item[display] || item}</span>}
        {item.items && (
          <I
            name="angle-right"
            className="ml-auto rotate"
            size="sm"
          />
        )}
      </div>
      {item.items && (
        <div data-collapse>
          {item.items.map((e) => (
            <MenuGroup
              key={e.id}
              item={e}
              display={display}
              selected={selected}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
function findById(id, items) {
  return _.getIn(items, _.insertBetween(id, 'items'));
}
MenuTree.propTypes = {
  items: PropTypes.array,
  display: PropTypes.string,
  onSelect: PropTypes.func,
  selected: PropTypes.string,
};
export function MenuTree({
  items,
  display = 'label',
  onSelect,
  selected,
}) {
  const clicked = (ev) => {
    ev.stopPropagation();
    const id = ev.target.id || ev.target.parentElement.id,
      item = findById(id, items);
    if (item && !item.items) onSelect(item.key);
  };
  return (
    <ul className="sidebar-menu fade-in">
      {items.map((e) => (
        <Fragment key={e.id}>
          <li className="menu-title uppercase">
            <I name={e.icon} size="lg" />
            <span>{e[display] || e}</span>
          </li>
          {e.items.map((t) => (
            <li key={t.id}>
              <MenuGroup
                item={t}
                display={display}
                onClick={clicked}
                selected={selected}
              />
            </li>
          ))}
        </Fragment>
      ))}
    </ul>
  );
}

Submenu.propTypes = {
  items: PropTypes.array,
  onClick: PropTypes.func,
  withLabel: PropTypes.bool,
  submenu: PropTypes.bool,
};
export function Submenu({ items, submenu, withLabel, onClick }) {
  return items ? (
    <ul className={classNames(['menu'], { submenu })}>
      {items.map((e) => (
        <MenuButton
          key={e.id}
          {...e}
          id={e.key}
          withLabel={withLabel}
          onClick={onClick}
        />
      ))}
    </ul>
  ) : null;
}
MenuButton.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  withLabel: PropTypes.bool,
  items: PropTypes.array,
};
function MenuButton({
  id,
  icon,
  label,
  className,
  onClick,
  withLabel,
  items,
}) {
  return (
    <li>
      <button
        id={id}
        data-prepend={getIcon(icon)}
        data-prepend-s
        data-append={getIcon(items && 'angle-double-right')}
        className={classNames(['minimal', className])}
        onClick={onClick}>
        {withLabel && label}
      </button>
      <Submenu
        submenu
        items={items}
        withLabel={withLabel}
        onClick={onClick}
      />
    </li>
  );
}
MenuItem.propTypes = {
  item: PropTypes.object,
  iconOnly: PropTypes.bool,
  openDown: PropTypes.bool,
  onClick: PropTypes.func,
  onSelect: PropTypes.func,
  active: PropTypes.string,
  size: PropTypes.string,
};
export function MenuItem({
  item,
  iconOnly,
  openDown,
  active,
  size,
  onClick,
  onSelect,
}) {
  const { id, key, icon, label } = item;
  return (
    <nav
      className={classNames(['menu-unit'], {
        'dir-down': openDown,
      })}>
      <button
        id={key}
        data-prepend={getIcon(icon)}
        className={classNames(['minimal', size], {
          show: active === id,
        })}
        onClick={onSelect}>
        {iconOnly ? undefined : label}
      </button>
      <Submenu items={item.items} withLabel onClick={onClick} />
    </nav>
  );
}
Menu.propTypes = {
  items: PropTypes.array,
  iconOnly: PropTypes.bool,
  style: PropTypes.object,
  row: PropTypes.bool,
  openDown: PropTypes.bool,
  size: PropTypes.string,
  className: PropTypes.string,
  onSelect: PropTypes.func,
};

export function Menu({
  items,
  iconOnly,
  row,
  openDown,
  size,
  className,
  style,
  onSelect,
}) {
  const clicked = ({ target }) => {
    const item = findById(target.id, items);
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
          item={e}
          openDown={openDown}
          iconOnly={iconOnly}
          onClick={clicked}
          size={size}
          className={className}
        />
      ))}
    </nav>
  );
}
