/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '.';
import { useDragTarget, useDraggable } from './helpers';
import './styles.css';

ListItem.propTypes = {
  value: PropTypes.object,
  style: PropTypes.object,
  parent: PropTypes.string,
};
export function ListItem({ value, parent }) {
  const [val, setVal] = useState(value.name),
    dragId = [parent, value.id].join('_'),
    { container, handle } = useDraggable(dragId),
    onChange = (ev) => {
      setVal(ev.target.value);
    };

  return (
    <div
      className="list-item"
      role="listitem"
      id={dragId}
      {...container}>
      <span className="handle" role="listitem" {...handle}>
        <Icon name="grip-vertical" styled="r" />
      </span>
      <input
        value={val}
        onChange={onChange}
        draggable={false}
        //disabled
      />
      <span>after</span>
    </div>
  );
}

List.propTypes = {
  id: PropTypes.string,
  values: PropTypes.array,
  style: PropTypes.object,
  onSwap: PropTypes.func,
};
export default function List({ id, values, style, onSwap }) {
  const bind = useDragTarget(id, onSwap);

  return (
    <div id={id} className="list" style={style} {...bind}>
      {values.map((e) => (
        <ListItem key={e.id} value={e} parent={id} />
      ))}
    </div>
  );
}
