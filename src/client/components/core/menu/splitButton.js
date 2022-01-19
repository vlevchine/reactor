import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Button, ButtonGroup } from '@app/components/core';
import { useCollapsible, dropdownCloseRequest } from '../helpers';
import { Menu, MenuItem } from './menu';

SplitButton.propTypes = {
  id: PropTypes.string,
  items: PropTypes.array,
  defaultItem: PropTypes.string,
  display: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string,
  openDown: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  minimal: PropTypes.bool,
  size: PropTypes.string,
  intent: PropTypes.string,
  openIcon: PropTypes.string,
};
export default function SplitButton({
  id,
  text,
  icon,
  items,
  display,
  defaultItem,
  openDown,
  openIcon = 'angle-down',
  size,
  intent,
  disabled,
  minimal,
  onClick,
}) {
  const main = text || icon,
    dflt = items[defaultItem || 0].id,
    onCollapsibleClick = (ev, dt) => {
      if (dt.onDropdown) {
        onClick?.(ev.target.id, id);
        dropdownCloseRequest(id);
      }
      if (!(dt.onDropdown || dt.onWrapper)) {
        dropdownCloseRequest(id);
      }
    },
    ref = useCollapsible(
      {
        animate: { duration: 400 },
        onClick: onCollapsibleClick,
      },
      id
    ),
    clickMain = () => onClick?.(dflt, id);

  return (
    <article
      ref={ref}
      className={classNames(['menu-unit', 'split-btn'], {
        'dir-down': openDown,
      })}>
      <ButtonGroup
        size={size}
        intent={intent}
        disabled={disabled}
        minimal={minimal}>
        {main && (
          <Button
            id={id}
            prepend={icon}
            text={text}
            onClick={clickMain}
          />
        )}
        <Button append={openIcon} data-collapse-trigger />
      </ButtonGroup>
      <div data-collapse>
        <Menu
          items={items}
          withLabel
          itemClass={(o) =>
            o.id === dflt ? 'option-check' : undefined
          }
          display={display}
          // className="visible"
        />
      </div>
    </article>
  );
}

MenuMore.propTypes = {
  items: PropTypes.array,
  onClick: PropTypes.func,
  id: PropTypes.string,
  display: PropTypes.string,
  size: PropTypes.string,
};
export function MenuMore({ id, items, display, onClick }) {
  const clicked = (_id) => {
    const item = _.getInItems(items, id);
    item && onClick?.(_id, id);
  };
  //   return <SplitButton {...rest} openIcon="ellipsis-v" />;
  return (
    <MenuItem
      items={items}
      display={display}
      icon={'ellipsis-v'}
      label={undefined}
      onClick={clicked}
    />
  );
}

SelectMenu.propTypes = {
  items: PropTypes.array,
  onClick: PropTypes.func,
  id: PropTypes.string,
  display: PropTypes.string,
  size: PropTypes.string,
};
export function SelectMenu({ id, items, display, onClick }) {
  const clicked = (_id) => {
    const item = _.getInItems(items, id);
    item && onClick?.(_id, id);
  };
  //   return <SplitButton {...rest} openIcon="ellipsis-v" />;
  return (
    <MenuItem
      items={items}
      display={display}
      icon={'ellipsis-v'}
      label={undefined}
      onClick={clicked}
    />
  );
}
