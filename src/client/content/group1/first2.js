import { useEffect, useReducer, useRef, useState } from 'react'; //, useRef, useEffect
import PropTypes from 'prop-types';
import { _ } from '@app/helpers';
//import { useToaster } from '@app/services';
import { process } from '@app/utils/immutable';
import '@app/content/styles.css';
import { mergeIds } from '@app/components/core/helpers';
import Form, { Field } from '@app/components/formit';
import { List, Button } from '@app/components/core';

let model = {
  listGroup: {
    id: 'listGroup',
    name: 'Sample Process',
    comment: 'This is a sample process definition',
    items: [
      {
        id: 'list1',
        name: 'First group',
        type: 'group',
        items: [
          {
            id: '1_1',
            name: 'Make video',
            comment: 'this is a task',
            mode: 'm',
            depends: [],
          },
          { id: '1_2', name: 'Prepare starter' },
          { id: '1_3', name: 'Mix leaven' },
          { id: '1_4', name: 'Do bulk fermentation' },
        ],
        comment: 'This group contains only tasks',
      },
      { id: '1', name: 'Dice carrots', mode: 'm' },
      { id: '2', name: 'Slice onion', mode: 'a' },
      { id: '3', name: 'Stew mushrooms', mode: 'm' },
      {
        id: 'list2',
        name: 'Second group',
        type: 'group',
        items: [
          { id: '2_1', name: 'Cook dinnero', mode: 'm' },
          { id: '2_2', name: 'Mix dough', mode: 'm' },
          { id: '2_3', name: 'Slow roast', mode: 'm' },
          { id: '2_4', name: 'Listen radio', mode: 'm' },
        ],
        comment: 'This group also contains only tasks',
      },
    ],
  },
};
// const getFullNames = (ids = [], items = [], itemsProp, titleProp) =>
//   ids.length
//     ? ids.map((id) => {
//         const name = [];
//         id.split('.').reduce((acc, e) => {
//           const tmp = acc.find((it) => it.id === e);
//           if (tmp) {
//             name.push(tmp[titleProp]);
//           }
//           return tmp?.[itemsProp] || tmp;
//         }, items);
//         return { id, name: name.join('/') };
//       })
//     : [];

const modes = [
  { id: 'm', label: 'Manual' },
  { id: 'a', label: 'Auto' },
];
ItemEditor.propTypes = {
  item: PropTypes.object,
  name: PropTypes.string,
  items: PropTypes.array,
  onDrag: PropTypes.func,
  onDelete: PropTypes.func,
  ctx: PropTypes.object,
};
function ItemEditor({ item, name, ctx }) {
  const // { itemsProp, titleProp } = config, //, items, onDelete
    onChange = (mod) => {
      setModel(mod);
    },
    // dependencies = getFullNames(
    //   item?.depends,
    //   items,
    //   itemsProp,
    //   titleProp
    // ),
    [model, setModel] = useState(item),
    priorities = ctx.getLookups(['priorityLevel'])['priorityLevel'];
  useEffect(() => {
    setModel(item);
  }, [item]);
  return (
    <div
      style={{
        flex: '1 1 auto',
        margin: '2rem 1rem',
        padding: '0.5rem 1rem',
        boxShadow: '1px 1px 0 2px var(--g-11)',
        borderRadius: '3px',
      }}>
      {item ? (
        <>
          <h5>{`${item.items ? 'Group' : 'Task'}: ${name}`}</h5>
          <Form
            id="sample"
            layout={{ cols: 5, rows: 5 }}
            onChange={onChange}
            model={model}
            ctx={ctx}
            context={(v) => ({
              noForm: !v.formRequired,
              isManual: v.mode === 'm',
            })}>
            <Field
              type="MultiSelect"
              dataid="assignable"
              loc={{ col: 1, row: 1, colSpan: 4 }}
              options={ctx.lookups.roles}
              display="name"
              clear
              prepend="user"
              label="Can be assigned to"
              hint="Select roles"
            />
            <Field
              type="Select"
              dataid="priority"
              loc={{ col: 5, row: 1 }}
              options={priorities}
              display="name"
              clear
              prepend="file-exclamation"
              label="Priority"
            />
            <Field
              type="Duration"
              dataid="duration"
              loc={{ col: 1, colSpan: 2, row: 2 }}
              clear
              prepend="clock"
              label="Task duration"
            />
            <Field
              type="TextInput"
              dataid="startCondition"
              loc={{ col: 3, colSpan: 3, row: 2 }}
              clear
              prepend="question-circle"
              label="Start condition"
            />
            <Field
              type="Select"
              dataid="mode"
              options={modes}
              defaultValue="m"
              loc={{ col: 1, row: 3, colSpan: 2 }}
              single
              pills
              label="Task start type"
            />
            <Field
              type="Duration"
              dataid="lag"
              loc={{ col: 3, row: 3, colSpan: 3 }}
              clear
              prepend="hourglass-half"
              label="Lag"
              disable="isManual"
              message="Time after previous Task finished"
            />
            <Field
              type="Checkbox"
              dataid="formRequired"
              loc={{ col: 1, row: 4 }}
              toggle
              intent="success"
              label="Form required"
              text="Task requires Form"
            />
            <Field
              type="Checkbox"
              dataid="approval"
              loc={{ col: 2, row: 4 }}
              toggle
              disable="noForm"
              intent="success"
              label="Approval required"
              text="Task requires approval"
            />
            <Field
              type="Checkbox"
              dataid="review"
              loc={{ col: 3, row: 4, colSpan: 2 }}
              toggle
              disable="Form"
              intent="success"
              label="Approval required"
              text="Task form must be reviewed before approval"
            />
            <Field
              type="TextArea"
              dataid="comment"
              loc={{ col: 1, row: 5, colSpan: 5 }}
              clear
              label="Comment"
              rows="4"
            />
          </Form>
        </>
      ) : (
        <h5>Select Task or group of tasks</h5>
      )}
    </div>
  );
}

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
const _id = 'listGroup',
  config = {
    itemsProp: 'items',
    titleProp: 'name',
    itemTitle: 'Task',
    addIcon: 'plus',
    icon: 'file',
    groupIcon: 'folder',
  };
const First2 = ({ ctx }) => {
  const { itemsProp } = config,
    [state, dispatch] = useReducer(onDispatch, {
      value: model,
      itemsProp,
    }),
    { selected, selectedName, value = {} } = state,
    selectionCache = useRef({}),
    def = value[_id],
    { name, items } = def,
    onSwap = ({ from, to }) => {
      const msg = {
        path: mergeIds(_id, itemsProp),
        value: {
          from: {
            id: _.insertRight(from.id, itemsProp),
            ind: from.ind,
          },
          to: {
            id: _.insertRight(to.id, itemsProp),
            ind: to.ind,
          },
        },
      };
      dispatch({ op: 'move', msg });
    },
    onChange = (msg, done) => {
      if (done && done.accept) {
        msg.path = mergeIds(
          _id,
          itemsProp,
          _.insertBetween(msg.path, itemsProp),
          msg.id
        );
        dispatch({ op: 'edit', msg });
      } else if (msg.path === selected)
        dispatch({ op: 'editing', value: msg.value });
    },
    onNewItem = (msg) => {
      msg.path = _.insertRight(mergeIds(_id, msg.id), itemsProp);
      msg.value.mode = 'a';
      dispatch({ op: 'add', msg });
    },
    onDelete = (iid) => {
      const toks = [_id, ...iid.split('.')],
        path = _.insertRight(_.initial(toks), itemsProp),
        value = _.last(toks);
      dispatch({ op: 'remove', msg: { path, value } });
    },
    onSelect = (ev, value) => {
      dispatch({ op: 'select', value });
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
    },
    //// toaster = useToaster(),
    onDeleteDep = (id) => {
      dispatch({
        op: `dependency_${id ? 'remove' : 'edit'}`,
        msg: {
          path: `${selectionCache.current.selected}.depends`,
          value: id || [],
        },
      });
    },
    selectedItem = selected
      ? _.getIn(items, _.insertBetween(selected, itemsProp))
      : undefined,
    itemName = selectedName || selectedItem?.name;
  Object.assign(selectionCache.current, {
    item: selectedItem,
    selected,
  });

  return (
    <>
      <h4>First_2</h4>
      <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <div style={{ width: '30rem', margin: '1rem 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}>
            <Button
              onClick={onSelect}
              minimal
              style={{ marginBottom: '0.5rem' }}>
              <h5>{name}</h5>
            </Button>
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
            onDrag={onSwap}
            dragCopy={!!selected}
            onAddItem={onNewItem}
            onItemChange={onChange}
            onDelete={onDelete}
            onSelect={onSelect}
            config={config}
            canAddGroups={false}
          />
        </div>
        <ItemEditor
          item={selectedItem || def}
          items={items}
          name={itemName}
          onDelete={onDeleteDep}
          ctx={ctx}
        />
      </div>
    </>
  );
};

First2.propTypes = {
  lookups: PropTypes.object,
  data: PropTypes.object,
  cached: PropTypes.object,
  ctx: PropTypes.object,
  cache: PropTypes.object,
  store: PropTypes.object,
  className: PropTypes.string,
};

export default First2;
