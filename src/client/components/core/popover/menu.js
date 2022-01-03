import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { getIcon, Button, ButtonGroup } from '@app/components/core'; // I,
//import { useCollapsible } from '@app/components/core/helpers';

function findById(id, items) {
  return _.getIn(items, _.insertBetween(id, 'items'));
}

Submenu.propTypes = {
  items: PropTypes.array,
  onClick: PropTypes.func,
  withLabel: PropTypes.bool,
  submenu: PropTypes.bool,
  className: PropTypes.string,
};
export function Submenu({
  items,
  submenu,
  withLabel,
  className,
  onClick,
}) {
  return items ? (
    <ul className={classNames(['menu', className], { submenu })}>
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
        onMouseDown={onClick}>
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

SplitButton.propTypes = {
  spec: PropTypes.object,
  display: PropTypes.string,
  openDown: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.string,
  intent: PropTypes.string,
};
export function SplitButton({
  spec,
  display = 'name',
  openDown,
  size,
  intent,
  disabled,
  onClick,
}) {
  const { key, icon, items } = spec,
    clicked = (arg, id) => {
      const _id = id || arg.target.id;
      if (_id) onClick?.(_id);
    };

  return (
    <nav
      className={classNames(['menu-unit', 'split-btn'], {
        'dir-down': openDown,
      })}>
      <ButtonGroup size={size} intent={intent} disabled={disabled}>
        <Button
          id={key}
          prepend={icon}
          text={spec[display]}
          onClick={clicked}
        />
        <Button append="angle-down" onClick={clicked} />
        <Submenu
          items={items}
          withLabel
          onClick={clicked}
          className="fade-in"
        />
      </ButtonGroup>
    </nav>
  );
}
