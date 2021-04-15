/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { mergeIds, useFauxCollapse, useCollapse } from './helpers'; //
import { useDrag } from './dnd';
import {
  ButtonGroup,
  Button,
  ConfirmDeleteBtn,
  Icon,
  EditableText,
} from '.';

const ItemList = ({ items, parent, config, drag, ...rest }) => {
  //forwardRef(, ref
  const { itemsProp, titleProp } = config,
    titleChanged = (v, id, done) => {
      if (done && v)
        config.onNewItem({
          id,
          path: _.insertRight(id, itemsProp),
          value: { [titleProp]: v },
        });
    },
    dragEnd = () => {},
    [ref] = useDrag(
      //, unregister
      drag && {
        id: parent,
        withHandle: true,
        dragEnded: dragEnd,
        update: items,
        allowDeepGroupDrop: false,
      }
    );
  console.log(parent);
  return (
    //ref is only used for upper-level list
    <div ref={ref}>
      <div className="list" data-drop={!!drag || undefined}>
        {items.map((e) => (
          <Item
            {...rest}
            key={e.id}
            parent={parent}
            value={e}
            drag={drag}
            config={config}
          />
        ))}
      </div>
      <span>
        <i className="clip-icon plus" />
        <EditableText
          id={parent}
          onChange={titleChanged}
          resetOnDone={true}
          style={{ marginBottom: '0.25rem' }}
          placeholder={'Add new Task...'}
        />
      </span>
    </div>
  );
};

ItemList.propTypes = {
  items: PropTypes.array,
  parent: PropTypes.string,
  config: PropTypes.object,
  drag: PropTypes.object,
};
Item.propTypes = {
  value: PropTypes.object,
  parent: PropTypes.string,
  className: PropTypes.string,
  selected: PropTypes.string,
  openItems: PropTypes.object,
  reset: PropTypes.bool,
  config: PropTypes.object,
  drag: PropTypes.object,
  dragEnd: PropTypes.func,
  onSelect: PropTypes.func,
};
export function Item({
  parent,
  config,
  drag,
  selected,
  value,
  reset,
  openItems,
  dragEnd,
  onSelect,
  className,
}) {
  const {
      itemsProp = 'items',
      titleProp = 'name',
      onTitleChange,
      onDelete,
      groupHint,
      itemHint,
      itemContent,
    } = config,
    dragAllowed = !!drag,
    { iconOn, icon, groupIcon } = drag || {},
    items = value?.[itemsProp],
    isGroup = !!items,
    [srcCollapse, tgtCollapse] =
      isGroup || itemContent
        ? useCollapse(!isGroup, 'left')
        : useFauxCollapse(),
    id = mergeIds(parent, value.id),
    isSelected = selected === id,
    titleChanged = (v, id, done) => {
      onTitleChange(
        {
          id,
          path: _.insertBetween(id, itemsProp),
          value: { [titleProp]: v },
          isSelected,
        },
        done
      );
    },
    deleting = () => {
      // unregister(id);
      const ids = _.insertBetween(id, itemsProp, { asArray: true });
      onDelete({
        path: _.initial(ids),
        value: _.last(ids),
        id,
      });
    };
  return (
    <div
      className={classNames(['list-item', className], {
        ['list-group']: isGroup,
        ['item-selected']: isSelected,
      })}
      data-draggable={dragAllowed}>
      <div
        ref={srcCollapse}
        className="item-header"
        data-drag-header={dragAllowed}>
        {icon && (
          <span
            data-drag-handle
            className={classNames([], { on: iconOn })}>
            <Icon
              name={isGroup ? groupIcon || icon : icon}
              styled="r"
            />
          </span>
        )}
        {onTitleChange ? (
          <EditableText
            value={value[titleProp]}
            id={id}
            onChange={titleChanged}
            resetOnDone={reset}
            placeholder={isGroup ? groupHint : itemHint}
          />
        ) : (
          <span className="title">{value[titleProp]}</span>
        )}
        {(onSelect || onDelete) && (
          <ButtonGroup minimal>
            <Button
              id={id}
              prepend="search"
              iconStyle="r"
              onClick={onSelect}
            />
            <ConfirmDeleteBtn
              id={id}
              text="this Task"
              toastText="Task"
              onDelete={deleting}
            />
          </ButtonGroup>
        )}{' '}
      </div>
      <div ref={tgtCollapse}>
        {isGroup ? (
          <ItemList
            items={items}
            parent={id}
            selected={selected}
            openItems={openItems}
            config={config}
            drag={drag}
            dragEnd={dragEnd}
            onSelect={onSelect}
          />
        ) : (
          itemContent && (
            <div className="item-content">{itemContent(value)}</div>
          )
        )}
      </div>
    </div>
  );
}

List.propTypes = {
  id: PropTypes.string,
  items: PropTypes.array,
  groups: PropTypes.array,
  onDragEnd: PropTypes.func,
  config: PropTypes.object,
  drag: PropTypes.object,
  selection: PropTypes.string,
};
export default function List({
  items,
  config,
  drag,
  selection,
  ...rest
}) {
  const openItems = useRef(new Set()),
    { itemsProp, groupName, itemName } = config,
    [selected, select] = useState(() =>
      _.dropInId(selection, itemsProp)
    ),
    id = config.id || 'listRoot',
    dragEnd = (value) => {
      const { from, to } = value;
      from.path = _.insertRight(from.id, itemsProp);
      to.path = _.insertRight(to.id, itemsProp);
      //immutable hadles move for multiple items
      from.ind = [from.ind];
      drag.onEnd({ value });
    },
    onSelect = (__, id) => {
      select(id);
      const { onSelect, itemsProp } = config;
      onSelect?.(_.insertBetween(id, itemsProp));
    };
  // [ref] = useDrag(
  //   !!drag && {
  //     id: id,
  //     withHandle: true,
  //     dragEnded: dragEnd,
  //     update: items,
  //     allowDeepGroupDrop: false,
  //   }
  // );
  config.groupHint = `${groupName || 'Group'} name here...`;
  config.itemHint = `${itemName || 'Item'} name here...`;

  useEffect(() => {
    select(_.dropInId(selection, itemsProp));
  }, [selection]);

  return (
    <ItemList
      items={items}
      parent={id}
      openItems={openItems.current}
      {...rest}
      config={config}
      drag={drag}
      dragEnd={dragEnd}
      onSelect={onSelect}
      selected={selected}
    />
  );
}
