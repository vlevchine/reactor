/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { I } from '@app/components/core';
import { useCollapsible } from '../helpers';

MenuGroup.propTypes = {
  item: PropTypes.object,
  display: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.string,
};
const animate = { duration: 400 };
function MenuGroup({ item, display, selected, onClick }) {
  const ref = item.items
    ? useCollapsible({ animate }, item.id)
    : useRef();

  return (
    <div ref={ref} className="menu-group expand-inline">
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
        onMouseDown={onClick}>
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

MenuTree.propTypes = {
  items: PropTypes.array,
  display: PropTypes.string,
  onSelect: PropTypes.func,
  selected: PropTypes.string,
};
export default function MenuTree({
  items,
  display = 'label',
  onSelect,
  selected,
}) {
  const clicked = (ev) => {
    ev.stopPropagation();
    const id = ev.target.id || ev.target.parentElement.id,
      item = _.getInItems(items, id);
    if (item && !item.items) onSelect(item.key);
  };

  return (
    <ul className="sidebar-menu">
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
