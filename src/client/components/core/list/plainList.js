/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useDrag } from '../dnd';
import { Readonly } from '..';
import ListItem from './listItem';

PlainList.propTypes = {
  id: PropTypes.string,
  dataid: PropTypes.string,
  value: PropTypes.array,
  fields: PropTypes.array,
  config: PropTypes.object,
  onDrag: PropTypes.func,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
  readonly: PropTypes.bool,
  numbered: PropTypes.bool,
  sharedOptions: PropTypes.string,
  style: PropTypes.object,
};
//Functional wrapper over NodeList
//As outer wrapper id is required for drag support, it's added as _id below
//for reporting selection or drag, it's removed
export default function PlainList({
  id,
  dataid,
  value,
  fields,
  onDrag,
  // onChange,
  style,
  readonly,
  //numbered,
  className,
  sharedOptions,
  config,
  ...rest
}) {
  const _id = dataid || id,
    dragged = (msg) => {
      const from = msg.from.id,
        to = msg.to.id;
      if (from.startsWith(_id))
        msg.from.id = from.substring(_id.length);
      if (to.startsWith(_id)) msg.to.id = to.substring(_id.length);
      onDrag?.(msg);
    },
    { ref } = onDrag
      ? useDrag({
          id: _id,
          dragEnded: dragged,
          // copy: rest.dragCopy,
          update: value?.length,
          allowDeepGroupDrop: false,
        })
      : useRef();

  if (sharedOptions) {
    const field = fields.find((f) => f.name === sharedOptions),
      assigned = value?.map((e) => e[sharedOptions]) || [];
    rest.config.allowedOptions = field.options.filter(
      (e) => !assigned.includes(e.id)
    );
  }

  return readonly && !value?.length ? (
    <Readonly />
  ) : (
    <div ref={ref} style={style}>
      {value.map((e) => {
        return (
          <ListItem
            key={e.id}
            config={config}
            value={e}
            fields={fields}
            className={className}
            // onItemChange={onItemChange}
            // onDelete={onDelete}
            // allowDrag={!!dragEnd}
            readonly={readonly}
          />
        );
      })}
    </div>
  );
}
