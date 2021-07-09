import { useReducer } from 'react';
import { nanoid } from 'nanoid';
import { useToaster } from '@app/services';

export const typeItems = [
  {
    id: 'common',
    title: 'Common',
    name: 'Complex types',
    items: [],
  },
  {
    id: 'custom',
    title: 'Custom',
    items: [],
  },
];

const lookupOpts = { sort: { name: 'asc' } },
  Lookup = {
    opts: lookupOpts,
    refetch: {
      type: 'Lookup',
      project: 'id name company',
      options: lookupOpts,
    },
  },
  typesOpts = { sort: { name: 'asc' } },
  refreshFilter = { entity: { $ne: true }, primitive: { $ne: true } },
  Type = {
    opts: typesOpts,
    refetch: {
      type: 'Type',
      project: 'id name company',
      options: typesOpts,
      filter: refreshFilter,
    },
  };
export const pageConfig = {
  Lookup,
  Type,
};

export function reducer(state, payload) {
  const res = { ...state, ...payload };
  if (payload.editing === null) res.editing = undefined;
  res.touched = state.editing && res.editing;
  return res;
}

export function init() {
  return {
    specific: [],
    common: [],
    selected: {},
    search: {},
    tab: typeItems[0].id,
  };
}

export function useTabbedLists(user, loadData) {
  const [state, dispatch] = useReducer(reducer, null, init),
    { tab, search, selected, editing } = state,
    typeItem = typeItems.find((e) => e.id === tab),
    item = selected[tab] || editing,
    toaster = useToaster(),
    onTab = (tab) => {
      dispatch({ tab });
    },
    onSearch = async (v) => {
      dispatch({ search: { ...search, [tab]: v } }); //Term: v ? new RegExp(v, 'i') : undefined });
    },
    startEdit = () => {
      dispatch({ editing: selected[tab] });
    },
    isOwner = () => user.isOwner(),
    isCommon = () => tab === typeItems[0].id,
    withCommon = (obj) => {
      return { ...obj, common: isCommon() ? 1 : 0 };
    },
    canEdit =
      (user.isDev() && tab === typeItems[1].id) ||
      (isOwner() && isCommon()),
    formRequest = (type) => {
      const req = {
        type,
        item: editing,
      };
      if (editing.id) {
        req.op = 'update';
        req.id = editing.id;
      } else {
        editing.id = nanoid(6);
        req.op = 'add';
      }
      return req;
    },
    onAdd = (type) => () => {
      const item = {
        selected: { ...selected, [tab]: undefined },
        editing: { name: `New ${type}`, fields: [] },
      };
      dispatch(item);
    },
    onNameEdit = (name, id, done) => {
      if (!done?.accept) return;
      dispatch({ editing: { ...editing, name } });
    },
    onEditEnd = (type) => async (accept) => {
      const res = { editing: null, selected };
      if (accept) {
        const [item, items] = await loadData([
          formRequest(type),
          withCommon(pageConfig[type].refetch),
        ]);
        res.selected[tab] = item.value;
        res[tab] = items;
      }
      toaster.info(`${type} Definition saved`);
      dispatch(res);
    },
    onDelete = (type) => async () => {
      const [, items] = await loadData([
          {
            op: 'delete',
            type,
            id: selected[tab].id,
          },
          withCommon(pageConfig[type].refetch),
        ]),
        res = { selected: {} };
      res[tab] = items;
      toaster.info(`${type} definition deleted`);
      ///TBD?? check res.ok === 1 ?
      dispatch(res);
    };

  typeItem.items = search[tab]
    ? state[tab]?.filter((e) =>
        new RegExp(search[tab], 'i').test(e.name)
      )
    : state[tab];

  return {
    state,
    dispatch,
    toaster,
    canEdit,
    typeItem,
    item,
    onTab,
    onSearch,
    startEdit,
    onAdd,
    onNameEdit,
    onEditEnd,
    onDelete,
    withCommon,
    isOwner,
    isCommon,
    formRequest,
  };
}

const kinds = [
  'currency',
  'percent',
  'height',
  'length',
  'weight',
  'distance',
];
export const columns = [
    {
      title: 'Name',
      id: 'name',
    },
    {
      title: 'Type',
      id: 'type',
      use: 'Select',
      //options: types,
    },
    {
      title: '!',
      id: 'required',
      use: 'Checkbox',
    },
    {
      title: '[]',
      id: 'multi',
      use: 'Checkbox',
    },
    { title: 'Shape', id: 'shape' },
    {
      title: 'Unit type',
      id: 'kind',
      use: 'Select',
      options: kinds,
    },
    { title: 'Lookup', id: 'lookups', use: 'Select' },
    { title: 'Ref', id: 'ref', use: 'Select' },
  ],
  primitive = {
    id: 'primitive',
    items: [
      {
        id: 'primitive',
        title: 'Primitives',
        name: 'Primitive types',
        items: [],
      },
    ],
  };
