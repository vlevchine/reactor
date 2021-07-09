import { useReducer, useRef } from 'react'; //, useEffect, useState, useRef, useEffect
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
//import { useToaster } from '@app/services';
//import { process } from '@app/utils/immutable';
import '@app/content/styles.css';
import { mergeIds } from '@app/components/core/helpers';
// import Form, { Field } from '@app/components/formit'; List,
import { Button } from '@app/components/core';

//page-specifc config
export const config = {};
const _id = 'listGroup',
  conf = {
    itemsProp: 'items',
    itemTitle: 'Task',
    groupIcon: 'folders',
  };
function onDispatch(state, { op, value, msg }) {
  let new_state = state;
  if (op === 'select') {
    new_state = { ...state, selected: value, selectedName: '' };
  } else if (op === 'editing') {
    new_state = { ...state, selectedName: value };
  } else if (msg) {
    msg.op = op.startsWith('dependency') ? op.substring(11) : op;
    new_state = { ...state, value: process(state.value, msg)[0] };
    if (msg.op === 'move') {
      //check if move causes id change in selected item
      //for now ONLY - if moving selected item to another group
      //moving selected item parent could potentially cause it too
      //but currently moving groups into another group not allowed
      const { from, to } = msg.value;
      if (mergeIds(from.id, msg.id) === state.selected)
        new_state.selected = mergeIds(to.id, msg.id);
    } else if (msg.op === 'remove') {
      new_state.selected = undefined;
    } else if (msg.op === 'add') {
      new_state.selected = mergeIds(msg.id, msg.value.id);
    }
  }

  return new_state;
}

ProcDefs.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
  className: PropTypes.string,
};
export default function ProcDefs({
  model,
  // def,
  // className = '',
  // ...rest
}) {
  const { itemsProp } = conf,
    [state, dispatch] = useReducer(onDispatch, {
      value: model,
      itemsProp,
    }),
    { selected, selectedName, value = {} } = state,
    selectionCache = useRef({}),
    def = value[_id] || {},
    { name, items } = def,
    onSelect = (ev, value) => {
      dispatch({ op: 'select', value });
    };
  console.log(items, selectedName, selectionCache);
  console.log(model);
  return (
    <>
      <h4>First_2</h4>
      <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <div
          className="list"
          style={{
            width: '30rem',
            margin: '1rem 0',
          }}>
          <div
            className={classNames(['item-header'], {
              ['selected']: !selected,
            })}
            style={{
              justifyContent: 'space-between',
              marginRight: '0.75rem',
            }}>
            <h6>{name}</h6>
            <Button
              minimal
              text="View details"
              prepend="search"
              onClick={onSelect}
            />
          </div>
          {/* <List
              items={items}
              selected={selected}
              onDrag={onSwap}
              dragCopy={!!selected}
              onAdd={onNewItem}
              onItemChange={onChange}
              onDelete={onDelete}
              onSelect={onSelect}
              config={conf}
              fields={['nmame']}
              canAddGroups={false}
            /> */}
        </div>

        {/* <ItemEditor
            item={selectedItem}
            items={items}
            name={itemName}
            onDelete={onDeleteDep}
            ctx={ctx}
          /> */}
      </div>
    </>
  );
}
