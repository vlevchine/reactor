/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { mergeIds, useCollapse } from './helpers'; //
import { useDrag } from './dnd';
import {
  ButtonGroup,
  Button,
  ConfirmDeleteBtn,
  Icon,
  EditableText,
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
    { icon, titleProp, groupTitle, itemTitle } = config;

  return (
    <div
      data-draggable={(allowDrag && !isGroup) || undefined}
      data-collapse-source={isGroup || undefined}
      className={classNames(['item-header'], {
        ['list-item']: !isGroup,
        ['item-selected']: isSelected,
      })}>
      {config.icon && (
        <span data-drag-handle>
          <Icon
            name={isGroup ? config.groupIcon || icon : icon}
            styled="r"
            style={isGroup ? { fontSize: '1.2em' } : undefined}
          />
        </span>
      )}
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
};
function Node({ id, value, ...rest }) {
  const {
      config,
      onItemChange,
      onSelect,
      onDelete,
      dragEnd,
      selected,
    } = rest,
    [refCollapse] = useCollapse(false, 'left');

  return (
    <div
      className="list-item list-group"
      ref={refCollapse}
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
      <NodeList {...rest} parent={id} items={value.items} />
    </div>
  );
}

NodeList.propTypes = {
  id: PropTypes.string,
  parent: PropTypes.string,
  items: PropTypes.array,
};
function NodeList({ id, parent, items, ...rest }) {
  const {
      config,
      onItemChange,
      onAdd,
      onSelect,
      onDelete,
      dragEnd,
      selected,
      canAddGroups,
    } = rest,
    [addTitle, setTitle] = useState(''),
    { titleProp, itemsProp, itemTitle, addIcon = 'plus' } = config,
    titleChanged = (v, id, done) => {
      if (!done) setTitle(v);
    },
    adding = (ev, _id) => {
      const value = { [titleProp]: addTitle };
      if (_id === 'folder') value[itemsProp] = [];
      onAdd({ value, id: parent });
    },
    { ref } = useDrag(
      dragEnd && {
        id: parent || id,
        dragEnded: dragEnd,
        // copy: rest.dragCopy,
        update: items?.length,
        allowDeepGroupDrop: false,
      }
    );
  useEffect(() => {
    setTitle('');
  }, [items]);

  return (
    <div
      ref={ref}
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
      <span>
        <ButtonGroup minimal>
          {canAddGroups && (
            <Button
              id="folder"
              prepend="folder-plus"
              onClick={adding}
              disabled={!addTitle}
              tooltip={`Add ${itemTitle} group`}
              style={{ fontSize: '1.2em' }}
            />
          )}
          <Button
            id="file"
            prepend={addIcon}
            disabled={!addTitle}
            tooltip={`Add ${itemTitle}`}
            onClick={adding}
          />
        </ButtonGroup>
        <EditableText
          id={id}
          onChange={titleChanged}
          resetOnDone
          style={{ marginBottom: '0.25rem' }}
          placeholder={`Add new ...`}
        />
      </span>
    </div>
  );
}

List.propTypes = {
  id: PropTypes.string,
  items: PropTypes.array,
  config: PropTypes.object,
  onDrag: PropTypes.func,
  onSelect: PropTypes.func,
  onAddItem: PropTypes.func,
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
  onAddItem,
  onItemChange,
  onDelete,
  canAddGroups,
}) {
  const _id = id || '_root',
    titleProp = config.titleProp,
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
    };

  return (
    <NodeList
      id={_id}
      config={config}
      items={items}
      onSelect={onSelect}
      onDelete={onDelete}
      onAdd={onAddItem}
      dragEnd={dragged}
      onItemChange={changing}
      selected={selection}
      canAddGroups={canAddGroups}
    />
  );
}
