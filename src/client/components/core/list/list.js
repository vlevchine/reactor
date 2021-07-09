/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useRef } from 'react';
import PropTypes from 'prop-types';
//import { classNames } from '@app/helpers';
import { mergeIds, useCollapse } from '../helpers'; //useEffect,
import { useDrag } from '../dnd';
//import AddItem from './addItem';
import ListItem from './listItem';
export { ListItem };

Node.propTypes = {
  value: PropTypes.object,
  id: PropTypes.string,
  addToolbar: PropTypes.array,
};
function Node({ id, value, ...rest }) {
  const {
      config,
      onItemChange,
      onSelect,
      onDelete,
      dragEnd,
      selected,
      addToolbar,
      className,
    } = rest,
    { ref } = useDrag(
      dragEnd && {
        id,
        dragEnded: dragEnd,
        // copy: rest.dragCopy,
        update: value.items?.length,
        allowDeepGroupDrop: false,
      }
    );
  useCollapse(ref, false, 'left');

  return (
    <div
      className="list-item list-group"
      ref={ref}
      data-draggable={!!dragEnd || undefined}>
      <ListItem
        id={id}
        config={config}
        value={value}
        className={className}
        isGroup={!!value.items}
        onItemChange={onItemChange}
        onSelect={onSelect}
        onDelete={onDelete}
        allowDrag={!!dragEnd}
        isSelected={id === selected}
      />
      <NodeList
        {...rest}
        parent={id}
        items={value.items}
        addToolbar={addToolbar}
      />
    </div>
  );
}

// const addToolbar = (title = 'item', group) => {
//   const res = [
//     {
//       id: 'item',
//       icon: 'folder',
//       tooltip: `Add ${title}`,
//     },
//   ];
//   if (group)
//     res.push({
//       id: 'group',
//       icon: 'folders',
//       tooltip: `Add ${title} group`,
//     });
//   return res;
// };

NodeList.propTypes = {
  id: PropTypes.string,
  parent: PropTypes.string,
  items: PropTypes.array,
  canAddGroups: PropTypes.bool,
};
function NodeList({ parent, items, ...rest }) {
  const {
    config,
    fields,
    onItemChange,
    onAdd,
    onSelect,
    onDelete,
    dragEnd,
    selected,
    className,
    //// canAddGroups,
  } = rest;

  return (
    <div
      className="list"
      data-collapse-target={!!parent || undefined}>
      <div data-drop={dragEnd ? 'active' : undefined}>
        {items?.map((e) => {
          const _id = mergeIds(parent, e.id);
          return e.items ? (
            <Node key={e.id} {...rest} id={_id} value={e} />
          ) : (
            <ListItem
              key={e.id}
              id={_id}
              value={e}
              fields={fields}
              className={className}
              icon={e.items ? 'trigram' : 'checkmark'}
              isGroup={!!e.items}
              config={config}
              onItemChange={onItemChange}
              onSelect={onSelect}
              isSelected={_id === selected}
              onDelete={onDelete}
              allowDrag={!!dragEnd}
            />
          );
        })}
      </div>
      {onAdd && parent === selected && (
        <ListItem
          value={{}}
          fields={fields}
          icon="plus"
          className={className}
          // isGroup={!!e.items}
          config={config}
          onItemChange={onItemChange}
          onDelete={() => {}}
        />
      )}
    </div>
  );
}

List.propTypes = {
  id: PropTypes.string,
  items: PropTypes.array,
  fields: PropTypes.array,
  config: PropTypes.object,
  onDrag: PropTypes.func,
  onSelect: PropTypes.func,
  onAdd: PropTypes.func,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  selection: PropTypes.string,
  canAddGroups: PropTypes.bool,
  style: PropTypes.object,
};
//Functional wrapper over NodeList
//As outer wrapper id is required for drag support, it's added as _id below
//for reporting selection or drag, it's removed
export default function List({
  id,
  items,
  onDrag,
  onChange,
  canAddGroups,
  style,
  ...rest
}) {
  const _id = id || '_root',
    dragged = (msg) => {
      const from = msg.from.id,
        to = msg.to.id;
      if (from.startsWith(_id))
        msg.from.id = from.substring(_id.length);
      if (to.startsWith(_id)) msg.to.id = to.substring(_id.length);
      onDrag?.(msg);
    },
    changing = (v, id, done) => {
      onChange?.({ op: id ? 'edit' : 'add', value: v }, id, done);
    },
    deleting = (value) => {
      onChange?.({ op: 'remove', value }, null, { accept: true });
    },
    { ref } = onDrag
      ? useDrag({
          id: _id,
          dragEnded: dragged,
          // copy: rest.dragCopy,
          update: items?.length,
          allowDeepGroupDrop: false,
        })
      : useRef();
  const adding = (v) => {
    const pld = {
      op: 'add',
      value: { v },
    };
    if (id === 'group') pld.items = [];
    console.log('list:', pld);
    onChange?.(pld, id, { accept: true });
  };

  return (
    <div ref={ref} style={style}>
      <NodeList
        {...rest}
        id={_id}
        items={items}
        onDelete={onChange ? deleting : undefined}
        dragEnd={onDrag ? dragged : undefined}
        onItemChange={onChange ? changing : undefined}
        canAddGroups={canAddGroups}
        onAdd={onChange ? adding : undefined}
      />
    </div>
  );
}
