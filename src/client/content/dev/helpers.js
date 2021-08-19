import { useReducer } from 'react';
import { useToaster, useDialog, useData } from '@app/services';
import {
  withCommon,
  formRequest,
  dfltRequestOptions,
} from '@app/content/helpers';

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

const Lookup = {
    opts: dfltRequestOptions,
    refetch: {
      type: 'Lookup',
      project: 'id name company',
      options: dfltRequestOptions,
    },
  },
  refreshFilter = { entity: { $ne: true }, primitive: { $ne: true } },
  Type = {
    opts: dfltRequestOptions,
    refetch: {
      type: 'Type',
      project: 'id name company',
      options: dfltRequestOptions,
      filter: refreshFilter,
    },
  },
  project = {
    Type: 'id name fields',
    Lookup: 'id name fields items',
  },
  addDialog = {
    Lookup: {
      title: 'Add Process definition',
      text:
        'Select a name for Lookup. Each Lookup will have "name" property, you can add up to 2 extra proppeties',
      cancelText: 'Cancel',
      form: {
        layout: { cols: 2, rows: 2 },
        items: [
          {
            type: 'TextInput',
            dataid: 'name',
            loc: { row: 1, col: 1, colSpan: 2 },
            clear: true,
            required: true,
            label: 'Name',
          },
        ],
      },
    },
    Type: {
      title: 'Add Type definition',
      text: 'Select new Type name',
      cancelText: 'Cancel',
      form: {
        layout: { cols: 1, rows: 1 },
        items: [
          {
            type: 'TextInput',
            dataid: 'name',
            loc: { row: 1, col: 1 },
            clear: true,
            required: true,
            label: 'Name',
          },
        ],
      },
    },
  };

const extraKeys = ['ex1', 'ex2'];
extraKeys.forEach((e, i) =>
  addDialog.Lookup.form.items.push({
    type: 'TextInput',
    dataid: e,
    loc: { row: 2, col: i + 1 },
    clear: true,
    label: `Extra prop #${i + 1}`,
  })
);

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

export function useTabbedLists(user) {
  const [state, dispatch] = useReducer(reducer, null, init),
    { tab, search, selected, editing } = state,
    typeItem = typeItems.find((e) => e.id === tab),
    toaster = useToaster(),
    dialog = useDialog(),
    { loadData } = useData(),
    onTab = (tab) => {
      dispatch({ tab });
    },
    onSearch = async (v) => {
      dispatch({ search: { ...search, [tab]: v } }); //Term: v ? new RegExp(v, 'i') : undefined });
    },
    onSelect = (type) => async (id) => {
      if (editing) return;
      if (id === selected[tab]?.id) {
        selected[tab] = undefined;
      } else {
        if (id !== primitive.id) {
          const [data] = await loadData([
            withCommon(
              {
                type,
                id,
                project: project[type],
              },
              isCommon()
            ),
          ]);
          selected[tab] = data;
        } else selected[tab] = primitive.items[0];
      }
      dispatch({ selected });
    },
    startEdit = () => {
      dispatch({ editing: selected[tab] });
    },
    isOwner = () => user.isOwner(),
    isCommon = () => tab === typeItems[0].id,
    canEdit =
      (user.isDev() && tab === typeItems[1].id) ||
      (isOwner() && isCommon()),
    onAdd = (type) => async () => {
      const { ok, data } = await dialog(addDialog[type]);
      if (ok) {
        if (type === 'Lookup') {
          data.items = [];
          const extra = extraKeys.map((e) => data[e]).filter(Boolean);
          if (extra.length > 0) data.fields = extra;
          extraKeys.forEach((e) => {
            delete data[e];
          });
        } else data.fields = [];
        const item = {
          selected: { ...selected, [tab]: undefined },
          editing: data,
        };
        dispatch(item);
      }
    },
    onEditEnd = (type) => async (accept) => {
      const res = { editing: null, selected };
      if (accept) {
        const [item, items] = await loadData([
          formRequest({ type, item: editing }),
          withCommon(pageConfig[type].refetch, isCommon()),
        ]);
        res.selected[tab] = item.value;
        res[tab] = items;
      }
      toaster.info(`${type} Definition saved`);
      dispatch(res);
    },
    onDelete = (type) => async () => {
      const [, items] = await loadData([
          formRequest({ type, id: selected[tab].id }),
          withCommon(pageConfig[type].refetch, isCommon()),
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
    onTab,
    onSearch,
    onSelect,
    startEdit,
    onAdd,
    onEditEnd,
    onDelete,
    isOwner,
    isCommon,
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
