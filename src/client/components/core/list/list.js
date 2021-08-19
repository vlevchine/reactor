/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { useCollapse } from '../helpers';
import { useDrag } from '../dnd';
import { Readonly, Button } from '..';
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
      fields,
      readonly,
    } = rest,
    { ref } = useDrag(
      _.undefinedOrSet(
        {
          id,
          dragEnded: dragEnd,
          copy: rest.dragCopy,
          update: value.items?.length,
          allowDeepGroupDrop: false,
        },
        readonly
      )
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
        fields={fields}
        className={className}
        isGroup={!!value.items}
        onItemChange={onItemChange}
        onSelect={onSelect}
        onDelete={onDelete}
        allowDrag={!!dragEnd}
        isSelected={id === selected}
        readonly={readonly}
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
  canAddGroups: PropTypes.bool,
  numbered: PropTypes.bool,
};
function NodeList({ parent, items, ...rest }) {
  const {
    config,
    fields,
    onItemChange,
    onSelect,
    onDelete,
    dragEnd,
    selected,
    className,
    numbered,
    readonly,
  } = rest;

  return (
    <div
      className={classNames(['list'], { numbered })}
      data-collapse-target={!!parent || undefined}>
      <div data-drop={dragEnd ? 'active' : undefined}>
        {items?.map((e) => {
          const _id = _.dotMerge(parent, e.id),
            isGroup = !!e.items;
          return isGroup ? (
            <Node
              key={e.id}
              {...rest}
              fields={fields}
              id={_id}
              value={e}
            />
          ) : (
            <ListItem
              key={e.id}
              id={_id}
              value={e}
              fields={fields}
              className={className}
              isGroup={isGroup}
              config={config}
              onItemChange={onItemChange}
              onSelect={onSelect}
              isSelected={_id === selected}
              onDelete={onDelete}
              allowDrag={!!dragEnd}
              readonly={readonly}
            />
          );
        })}
      </div>
      {!readonly && parent === selected && (
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
  title: PropTypes.string,
  dataid: PropTypes.string,
  value: PropTypes.array,
  fields: PropTypes.array,
  config: PropTypes.object,
  onDrag: PropTypes.func,
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  selected: PropTypes.string,
  addGroups: PropTypes.number,
  readonly: PropTypes.bool,
  numbered: PropTypes.bool,
  sharedOptions: PropTypes.string,
  style: PropTypes.object,
};
//Functional wrapper over NodeList
//As outer wrapper id is required for drag support, it's added as _id below
//for reporting selection or drag, it's removed
export default function List({
  id,
  title,
  dataid,
  value,
  fields,
  onDrag,
  onChange,
  onSelect,
  selected,
  addGroups,
  style,
  readonly,
  numbered,
  sharedOptions,
  config,
  ...rest
}) {
  const _id = dataid || id || '_root',
    [selection, select] = useState({ id: selected }),
    selecting = (ev, _id) => {
      const __id = _.setOrUndefined(_id, _id !== selection.id),
        sel = {
          id: __id,
          path: _.insertBetween(__id, config.itemsProp),
        };
      select(sel);
      onSelect?.(dataid || id, sel);
    },
    dragged = (msg) => {
      const from = msg.from.id,
        to = msg.to.id;
      if (from.startsWith(_id))
        msg.from.id = from.substring(_id.length);
      if (to.startsWith(_id)) msg.to.id = to.substring(_id.length);
      msg.from.id = _.insertRight(msg.from.id, config.itemsProp);
      msg.to.id = _.insertRight(msg.to.id, config.itemsProp);
      if (onDrag) {
        onDrag(msg, id);
      } else {
        onChange?.(msg, [id], 'move');
      }
    },
    changing = (v, _id, done, item) => {
      if (done) {
        if (!_id)
          fields
            .filter((f) => f.options && !(item[f.name] || v[f.name]))
            .forEach((f) => {
              v[f.name] = f.options[0];
            });
        fields
          .filter((f) => f.min && !v[f.name])
          .forEach((f) => {
            v[f.name] = f.min;
          });
        const __id = _.dotMerge(id, ...selection.path);
        onChange?.(v, __id, _id ? 'update' : 'add');
      }
    },
    onAddGroup = () => {
      const path = _.dotMerge(id, selection.path);
      onChange?.({ name: 'New group', items: [] }, path, 'add');
    },
    deleting = (value) => {
      onChange?.(value, _id, 'remove', { accept: true });
    },
    level = selection.id ? selection.id.split('.').length : 0,
    item = _.getIn(value, selection.path),
    groupSelected = item?.items || value,
    { ref } = useDrag(
      _.undefinedOrSet(
        {
          id: _id,
          dragEnded: dragged,
          copy: rest.dragCopy,
          update: value?.length,
          allowDeepGroupDrop: false,
        },
        readonly
      )
    );

  if (sharedOptions) {
    const field = fields.find((f) => f.name === sharedOptions),
      assigned = value?.map((e) => e[sharedOptions]) || [];
    config.allowedOptions = field.options.filter(
      (e) => !assigned.includes(e.id)
    );
  }

  useEffect(() => {
    selection.id !== selected && selecting(null, selected);
  }, [selected]);

  return (
    <div ref={ref} style={style}>
      {title && (
        <div className="justaposed">
          <h6>{title}</h6>
          {!readonly &&
            addGroups &&
            level < addGroups &&
            groupSelected && (
              <Button
                id="group"
                text="Add group"
                size="xs"
                prepend="plus"
                iconStyle="r"
                onClick={onAddGroup}
              />
            )}
        </div>
      )}
      {readonly && !value?.length ? (
        <Readonly />
      ) : (
        <NodeList
          {...rest}
          id={_id}
          items={value}
          fields={fields}
          onSelect={_.setOrUndefined(selecting, onSelect)}
          selected={selection.id}
          onDelete={deleting}
          dragEnd={_.undefinedOrSet(dragged, readonly)}
          onItemChange={changing}
          numbered={numbered}
          readonly={readonly}
          config={config}
        />
      )}
    </div>
  );
} //_.setOrUndefined(deleting, readonly)

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
export function PlainList({
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
