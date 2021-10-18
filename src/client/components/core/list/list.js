/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { useCollapse } from '../helpers';
import { useDrag } from '../dnd';
import { Readonly, Button, EditableText } from '..';
import ListItem from './listItem';
export { ListItem };
export { default as PlainList } from './plainList';

const none = { id: undefined, path: undefined };

NodeList.propTypes = {
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  parent: PropTypes.string,
  items: PropTypes.array,
  canAddGroups: PropTypes.bool,
  numbered: PropTypes.bool,
};
function NodeList({ parent, value, ...rest }) {
  const {
      onChange,
      config,
      fields,
      dragEnd,
      selected,
      className,
      numbered,
      readonly,
    } = rest,
    id = value.id,
    canAdd = !readonly && (selected ? id === selected : !parent),
    adding = (v, _id, done) => {
      if (done?.accept) {
        const name = fields[0]?.name || fields[0];
        onChange(
          { [name]: v, id: _.generateId(config.itemName, 4) },
          _.dotMerge(
            config.prop,
            _.insertRight(parent, config.itemsProp)
          ),
          'add'
        );
      }
    },
    { ref } = useDrag(
      _.undefinedOrSet(
        {
          id: parent || id,
          dragEnded: dragEnd,
          copy: rest.dragCopy,
          update: value.items?.length,
          allowDeepGroupDrop: false,
        },
        readonly
      )
    );
  if (parent) useCollapse(ref, false, 'left');

  return (
    <div
      ref={ref}
      className={classNames(['list'], { numbered })}
      data-draggable={!!(dragEnd && parent) || undefined}>
      {parent && (
        <ListItem
          {...rest}
          path={parent}
          value={value}
          isGroup
          isSelected={value?.id === selected}
          allowDrag={!!dragEnd}
        />
      )}
      <div
        className="list-group"
        data-drop={dragEnd ? 'active' : undefined}
        data-collapse-target={!!parent || undefined}>
        {value?.items.map((e) => {
          const path = parent ? _.dotMerge(parent, e.id) : e.id;
          return e.items ? (
            <NodeList key={e.id} {...rest} parent={path} value={e} />
          ) : (
            <ListItem
              {...rest}
              key={e.id}
              value={e}
              path={path}
              isSelected={e.id === selected}
              allowDrag={!!dragEnd}
            />
          );
        })}
      </div>
      {canAdd && (
        <span className="item-header">
          <EditableText
            className={className}
            value={value?.[id]}
            dataid="add"
            minimal
            readonly={readonly}
            onChange={adding}
            resetOnDone
            // blurOnEnter
            placeholder={`New ${config.itemName} name...`}
          />
        </span>
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
  allowDrag: PropTypes.bool,
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
  allowDrag,
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
    [selection, select] = useState({
      path: selected,
      id: _.last(selected?.split('.')),
    }),
    selecting = (ev, _id) => {
      const ids = _id?.split('.'),
        fullPath = !ids || ids.includes(config.itemsProp);
      let sel = _id
        ? {
            id: _.last(_id?.split('.')),
            path: fullPath
              ? _id
              : _.insertBetween(_id, config.itemsProp),
          }
        : none;
      if (sel.id === selection.id) sel = none;
      select(sel);
      // const lid = sel.path
      //   ?.split('.')
      //   .filter((e) => e !== config.itemsProp)
      //   .join('.');
      onSelect?.(dataid || id, sel.path);
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
    changing = (v, _id, item) => {
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
      if (_id) {
        const iid = _.dotMerge(
          id,
          _.insertBetween(_id, config.itemsProp)
        );
        onChange?.(v, iid, 'update');
      } else onChange?.(v);
    },
    onAddGroup = () => {
      const innerPath = _.dotMerge(selection.path, 'items'),
        path = selection.path ? _.dotMerge(id, innerPath) : id,
        val = {
          id: _.generateId('gr', 4),
          name: 'New group',
          items: [],
        };
      // select({
      //   id: val.id,
      //   path: selection.path ? _.dotMerge(innerPath, val.id) : val.id,
      // });
      onChange?.(val, path, 'add');
    },
    deleting = (value) => {
      const v = _.insertBetween(value, config.itemsProp);
      onChange?.(v, _id, 'remove', { accept: true });
      select({});
    },
    level = selection.id ? selection.id.split('.').length : 0,
    item = _.getIn(value, selection.path),
    groupSelected = item?.items || value;

  if (sharedOptions) {
    const field = fields.find((f) => f.name === sharedOptions),
      assigned = value?.map((e) => e[sharedOptions]) || [];
    config.allowedOptions = field.options.filter(
      (e) => !assigned.includes(e.id)
    );
  }

  useEffect(() => {
    selection.path !== selected && selecting(null, selected);
  }, [selected]);

  return (
    <div style={style}>
      <div className="justaposed">
        {title && <h6>{title}</h6>}
        {!readonly &&
          addGroups &&
          level < addGroups &&
          groupSelected && (
            <Button
              id="group"
              text="Add group"
              // size="xs"
              minimal
              prepend="plus"
              iconStyle="r"
              onClick={onAddGroup}
            />
          )}
      </div>
      {readonly && !value?.length ? (
        <Readonly />
      ) : (
        <NodeList
          {...rest}
          value={{ id: _id, items: value || [] }}
          fields={fields}
          onSelect={_.setOrUndefined(selecting, onSelect)}
          selected={selection.id}
          onDelete={deleting}
          dragEnd={_.undefinedOrSet(dragged, !allowDrag || readonly)}
          onItemChange={changing}
          onChange={onChange}
          numbered={numbered}
          readonly={readonly}
          config={config}
        />
      )}
    </div>
  );
} //_.setOrUndefined(deleting, readonly)
