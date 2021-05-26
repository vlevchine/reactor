/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { mergeIds, useCollapse } from './helpers'; //useEffect,
import { useDrag } from './dnd';
import {
  ButtonGroup,
  Button,
  ConfirmDeleteBtn,
  Icon,
  EditableText,
  AddItem,
} from '.';

const typeHint = (str) => `${str || ''} name...`;

NodeHeader.propTypes = {
  id: PropTypes.string,
  value: PropTypes.object,
  config: PropTypes.object,
  onItemChange: PropTypes.func,
  onSelect: PropTypes.func,
  isSelected: PropTypes.bool,
  onDelete: PropTypes.func,
  allowDrag: PropTypes.bool,
};
function NodeHeader({
  id,
  config,
  value,
  onItemChange,
  onSelect,
  isSelected,
  onDelete,
  allowDrag,
}) {
  const isGroup = !!value.items,
    { titleProp, groupTitle, itemTitle } = config;

  return (
    <div
      data-draggable={(allowDrag && !isGroup) || undefined}
      data-collapse-source={isGroup || undefined}
      className={classNames(['item-header'], {
        ['list-item']: !isGroup,
        ['item-selected']: isSelected,
      })}>
      <span data-drag-handle>
        <Icon
          name={isGroup ? 'folders' : 'folder'}
          styled="r"
          style={isGroup ? { fontSize: '1.1em' } : undefined}
        />
      </span>
      {onItemChange ? (
        <EditableText
          value={value[titleProp]}
          id={id}
          onChange={onItemChange}
          resetOnDone
          placeholder={typeHint(isGroup ? groupTitle : itemTitle)}
        />
      ) : (
        <span className="title">{value[titleProp]}</span>
      )}
      <ButtonGroup minimal>
        <Button
          id={id}
          prepend="search"
          iconStyle="r"
          onClick={onSelect}
        />
        {onDelete && (
          <ConfirmDeleteBtn
            id={id}
            text={`this ${config.itemTitle}${
              isGroup ? ' group' : ''
            }`}
            toastText={`${config.itemTitle}${
              isGroup ? ' group' : ''
            }`}
            onDelete={onDelete}
          />
        )}
      </ButtonGroup>
    </div>
  );
}

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
      <NodeHeader
        id={id}
        config={config}
        value={value}
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

NodeList.propTypes = {
  id: PropTypes.string,
  parent: PropTypes.string,
  items: PropTypes.array,
  addToolbar: PropTypes.array,
};
function NodeList({ parent, items, ...rest }) {
  const {
    config,
    onItemChange,
    ////onAdd,
    addItem,
    onSelect,
    onDelete,
    dragEnd,
    selected,
  } = rest;
  //   { titleProp, itemsProp } = config,
  // adding = ({ value, id }) => {
  //   const val = { [titleProp]: value };
  //   if (id === 'group') val[itemsProp] = [];
  //   onAdd({ value: val, id: parent });
  // };

  return (
    <div
      className="list"
      data-collapse-target={!!parent || undefined}>
      <div data-drop={dragEnd ? 'active' : undefined}>
        {items.map((e) => {
          const _id = mergeIds(parent, e.id);
          return e.items ? (
            <Node key={e.id} {...rest} id={_id} value={e} />
          ) : (
            <NodeHeader
              key={e.id}
              id={_id}
              value={e}
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
      {parent === selected && addItem}
    </div>
  );
}

List.propTypes = {
  id: PropTypes.string,
  items: PropTypes.array,
  config: PropTypes.object,
  onDrag: PropTypes.func,
  onSelect: PropTypes.func,
  onAdd: PropTypes.func,
  onItemChange: PropTypes.func,
  onDelete: PropTypes.func,
  selection: PropTypes.string,
  canAddGroups: PropTypes.bool,
};
//Functional wrapper over NodeList
//As outer wrapper id is required for drag support, it's added as _id below
//for reporting selection or drag, it's removed
export default function List({
  id,
  items,
  config,
  onDrag,
  selection,
  onSelect,
  onAdd,
  onItemChange,
  onDelete,
  canAddGroups,
}) {
  const _id = id || '_root',
    { titleProp, itemTitle } = config,
    dragged = (msg) => {
      const from = msg.from.id,
        to = msg.to.id;
      if (from.startsWith(_id))
        msg.from.id = from.substring(_id.length);
      if (to.startsWith(_id)) msg.to.id = to.substring(_id.length);
      onDrag?.(msg);
    },
    changing = (v, id, done) => {
      onItemChange?.({ path: id, id: titleProp, value: v }, done);
    },
    { ref } = useDrag({
      id: _id,
      dragEnded: dragged,
      // copy: rest.dragCopy,
      update: items?.length,
      allowDeepGroupDrop: false,
    });
  const adding = ({ value, id }) => {
      onAdd({
        [titleProp]: value,
        items: id === 'group' ? [] : undefined,
      });
    },
    addToolbar = useMemo(() => [
      {
        id: 'item',
        icon: 'folder',
        tooltip: `Add ${itemTitle}`,
      },
      {
        id: 'group',
        icon: 'folders',
        tooltip: `Add ${itemTitle} group`,
      },
    ]),
    addItem = <AddItem onAdd={adding} toolbar={addToolbar} />;

  return (
    <div ref={ref}>
      <NodeList
        id={_id}
        config={config}
        items={items}
        onSelect={onSelect}
        onDelete={onDelete}
        dragEnd={dragged}
        onItemChange={changing}
        selected={selection}
        canAddGroups={canAddGroups}
        addItem={addItem}
      />
    </div>
  );
}
