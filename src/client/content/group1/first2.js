import { useReducer } from 'react'; //, useRef, useEffect
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
import { process } from '@app/utils/immutable';
import '@app/content/styles.css';
import { mergeIds } from '@app/components/core/helpers';
import { useDrag } from '@app/components/core/dnd';
import { List, Button } from '@app/components/core';

let model = {
  listGroup: {
    id: 'listGroup',
    name: 'Sample Process',
    items: [
      {
        id: 'list1',
        name: 'First group',
        items: [
          { id: '1_1', name: 'Make video' },
          { id: '1_2', name: 'Prepare starter' },
          { id: '1_3', name: 'Mix leaven' },
          { id: '1_4', name: 'Do bulk fermentation' },
        ],
      },
      { id: '1', name: 'Dice carrots' },
      { id: '2', name: 'Slice onion' },
      { id: '3', name: 'Stew mushrooms' },
      {
        id: 'list2',
        name: 'Second group',
        items: [
          { id: '2_1', name: 'Cook dinnero' },
          { id: '2_2', name: 'Mix dough' },
          { id: '2_3', name: 'Slow roast' },
          { id: '2_4', name: 'Listen radio' },
        ],
      },
    ],
  },
};
ItemEditor.propTypes = {
  item: PropTypes.object,
  name: PropTypes.string,
};
function ItemEditor({ item, name }) {
  const dragEnd = (a, b) => {
      console.log(a, b);
    },
    [ref] = useDrag({
      id: 'dependncy',
      dragEnded: dragEnd,
      update: item,
    });

  return (
    <div
      ref={ref}
      style={{
        flex: '1 1 auto',
        margin: '2rem 1rem',
        backgroundColor: 'lightblue',
      }}>
      {item ? (
        <>
          <h5>{`${item.items ? 'Group' : 'Task'}: ${name}`}</h5>
          <div
            data-drop
            style={{
              height: '2rem',
              width: '100%',
              border: '1px solid grey',
            }}
          />
        </>
      ) : (
        <h5>Select Task or group of tasks</h5>
      )}
    </div>
  );
}

function getSelection({ selected, value }) {
  return _.getIn(value, selected, true);
}
function onDispatch(state, { selected, op, msg, editing }) {
  const new_state = { ...state };
  if (selected) {
    new_state.selected = selected;
    new_state.selectedName = getSelection(new_state)?.name;
    return new_state;
  }
  if (editing && editing.isSelected) {
    new_state.selectedName = editing.value.name;
    return new_state;
  }
  if (msg) {
    msg.op = op;
    new_state.value = process(state.value, msg)[0];
    if (op === 'move') {
      //check if move causes id change in selected item
      //for now ONLY - if moving selected item to another group
      //moving selected item parent could potentially cause it too
      //but currently moving groups into another group not allowed
      const { from, to } = msg.value;
      if (state.selected && from.id !== to.id) {
        const parent = _.getIn(state.value, from.path, true),
          itemId = parent[from.ind[0]]?.id;
        if (mergeIds(from.path, itemId) === state.selected)
          new_state.selected = mergeIds(to.path, itemId);
      }
    } else if (op === 'remove') {
      new_state.selected = undefined;
    } else if (op === 'add')
      new_state.selected = mergeIds(msg.path, msg.value.id);
    new_state.selectedName = getSelection(new_state)?.name;
    return new_state;
  }

  return state;
}
const _id = 'listGroup',
  itemsProp = 'items',
  titleProp = 'name';
const First2 = () => {
  const [state, dispatch] = useReducer(onDispatch, {
      value: model,
    }),
    { selected, selectedName, value = {} } = state,
    selectedItem = getSelection(state),
    { name, items } = value[_id],
    onSwap = (msg) => {
      dispatch({ op: 'move', msg });
    },
    onChange = (msg, done) => {
      if (done) {
        dispatch({ op: 'update', msg });
      } else dispatch({ editing: msg });
    },
    onNewItem = (msg) => {
      dispatch({ op: 'add', msg });
    },
    onDelete = (msg) => {
      dispatch({ op: 'remove', msg });
    },
    onSelect = (selected) => {
      dispatch({ selected });
    },
    addGroup = () => {
      dispatch({
        op: 'add',
        msg: {
          path: [_id, itemsProp],
          value: { name: undefined, [itemsProp]: [] },
          id: _id,
        },
      });
    };

  return (
    <>
      <h4>First_2</h4>
      <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <div style={{ width: '40rem', margin: '1rem 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}>
            <h5 style={{ marginBottom: '0.5rem' }}>{name}</h5>
            <Button
              minimal
              text="Add Group"
              className="clip-icon before plus"
              onClick={addGroup}
            />
          </div>
          <List
            items={items}
            selection={selected}
            drag={{
              iconOn: true,
              icon: 'file-invoice',
              groupIcon: 'tasks',
              onEnd: onSwap,
            }}
            config={{
              id: _id,
              titleProp,
              itemsProp,
              itemName: 'Task',
              groupName: 'Group',
              onNewItem,
              onTitleChange: onChange,
              onDelete,
              onSelect,
              // itemContent:{(v) => <div>{v.id}</div>}
            }}
          />
        </div>
        <ItemEditor item={selectedItem} name={selectedName} />
      </div>
    </>
  );
};

First2.propTypes = {
  def: PropTypes.object,
  lookups: PropTypes.object,
  data: PropTypes.object,
  cached: PropTypes.object,
  cache: PropTypes.object,
  store: PropTypes.object,
  className: PropTypes.string,
};

export default First2;
