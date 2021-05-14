import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import {
  Checkbox,
  TextArea,
  TagGroup,
  EditableText,
} from '@app/components/core';

const parseObjectProp = (pr1, pr2) => (str, e) => {
  const [ind, span] = str.split('/').map(Number);
  return {
    loc: Object.assign(e.loc, {
      [pr1]: ind || 1,
      [pr2]: span || 1,
    }),
  };
};

export const allProps = {
  column: {
    label: 'Column/span',
    asString: ($, val) => {
      const { col, colSpan = 1 } = val.loc;
      return `${col} / ${colSpan}`;
    },
    parse: parseObjectProp('col', 'colSpan'),
  },
  row: {
    label: 'Row/span',
    asString: ($, val) => {
      const { row, rowSpan = 1 } = val.loc;
      return `${row} / ${rowSpan}`;
    },
    parse: parseObjectProp('row', 'rowSpan'),
  },
  layout: {
    initial: { rows: 1, cols: 1 },
    label: 'Columns/Rows',
    asString: (layout = {}) => {
      const { rows, cols } = layout;
      return rows && cols ? `${cols} / ${rows}` : '';
    },
    parse: (str) => {
      const [cols, rows] = str.split('/').map(Number);
      return cols && rows ? { rows, cols } : undefined;
    },
  },
  title: { initial: 'Title here...', label: 'Title' },
  label: { initial: 'Label here...', label: 'Label' },
  display: {
    initial: 'label',
    label: 'Display',
    asString: (f) => {
      return f.toString();
    },
    parse: (f) => (f.includes('=>') ? eval(f) : f),
  },
  dataid: { label: 'Data id' }, //initial: 'id',
  prepend: { label: 'Prepend' },
  append: { label: 'Append' },
  message: { label: 'Message' },
  style: { label: 'Style', component: TextArea },
  filterBy: { label: 'Filter by' },
  appendType: { label: 'Append type' },
  rows: { label: 'Rows' },
  inner: { label: 'HTML' },
  tagIntent: { label: 'Tag intent' },
  text: { label: 'Text' },
  labels: {
    label: 'Lbels',
    component: TextArea,
    asString: (v) => v.join(`\n`),
    parse: (v = '') => v.split(/\n/).filter(Boolean),
  },
  height: { label: 'Height' },
  hide: { label: 'Hide' },
  disable: { label: 'Disable' },
  clear: { label: "'Clear' Button'", component: Checkbox },
  minimal: { label: 'Minimal', component: Checkbox },
  toggle: { label: 'Toggle', component: Checkbox },
  search: { label: 'Search', component: Checkbox },
  editable: { label: 'Editiable', component: Checkbox },
  initials: { label: 'Use initials', component: Checkbox },
  horizontal: { label: 'Horizontal', component: Checkbox },
  vertical: { label: 'Vertical', component: Checkbox },
  tabs: {
    label: 'Tabs',
    component: (e) => {
      const [tab, setTab] = useState(e.values[0].id),
        selected = e.values.find((e) => e.id === tab),
        { label, asString, parse } = allProps.layout,
        onSelect = (id) => {
          setTab(id);
        },
        onChange = (v, id, status) => {
          if (!status) return;
          let val = v,
            same = false;
          if (status.accept) {
            if (id === 'layout') {
              val = asString(parse(v, selected?.layout));
              same = val === asString(selected?.[id]);
            } else same = val === selected?.[id];
            if (val && !same) {
              e.onChange(val, id || e.id, status, tab);
            }
          } else {
            val = status === 'add' ? createTab(v) : v;
            e.onChange(val, id || e.id, status);
          }
        };
      useEffect(() => {
        const ids = e.values.map((e) => e.id);
        if (!ids.includes(tab)) setTab(e.values[0].id);
      }, [e.values]);
      return (
        <>
          <TagGroup
            options={e.values}
            display="title"
            single
            clear
            editable
            selected={[tab]}
            onSelect={onSelect}
            onChange={onChange}
          />
          <div className="prop">
            <label htmlFor="tabName">Title:</label>
            <span id="tabName" className="prop-value">
              <EditableText
                id="title"
                placeholder="<Title>"
                value={selected?.title}
                onChange={onChange}
              />
            </span>
          </div>
          <div className="prop">
            <label>{label}:</label>
            <span className="prop-value">
              <EditableText
                id="layout"
                resetOnDone
                placeholder="<Layout>"
                value={asString(selected?.layout)}
                onChange={onChange}
              />
            </span>
          </div>
        </>
      );
    },
  },
};
const common = [
  'label',
  'dataid',
  'row',
  'column',
  'minimal',
  'message',
  'style',
];
const containers = {
    Form: { props: ['title', 'layout'] },
    Section: {
      props: ['title', 'layout', 'row', 'column', 'hide', 'disable'],
    },
    Panel: {
      props: ['title', 'layout', 'row', 'column', 'hide', 'disable'],
    },
    Tabs: {
      props: [
        'title',
        'row',
        'column',
        'vertical',
        'hide',
        'disable',
        'tabs',
      ],
    },
    Tab: { props: [] },
  },
  components = {
    TextInput: {
      name: 'Text Input',
      props: ['clear', 'prepend', 'append', 'appendType'],
    },
    NumberInput: {
      name: 'Number Input',
      props: ['clear', 'prepend', 'append', 'appendType'],
    },
    DateInput: {
      name: 'Date Input',
      props: ['clear', 'prepend'],
    },
    Select: {
      props: ['clear', 'search', 'filterBy', 'display', 'prepend'],
    }, //
    MultiSelect: {
      name: 'Multi Select',
      props: [
        'clear',
        'search',
        'filterBy',
        'display',
        'prepend',
        'append',
        'appendType',
      ],
    },
    TagGroup: {
      name: 'Tag Group',
      props: [
        'clear',
        'tagIntent',
        'initials',
        'editable',
        'prepend',
        'append',
      ],
    },
    Checkbox: { props: ['text', 'toggle', 'height'] },
    Radio: { name: 'Radio Buttons', props: ['horizontal'] },
    Cascade: { props: ['labels', 'horizontal'] },
    TextArea: {
      name: 'Text Area',
      props: ['clear', 'rows', 'prepend', 'append'],
    },
    RawHtml: { name: 'Raw Html', props: ['inner'] },
  };
// forbid = {
//   Form: ['Tab'],
//   Section: ['Tab'],
//   Panel: ['Tab'],
//   Tabs: ['Section', 'Panel', 'Tabs'],
// };

export const getProps = (type) => {
  const isContainer = Object.keys(containers).includes(type);
  if (isContainer) return containers[type]?.props;
  return [...common, ...components[type]?.props];
};

const createTab = (name) => ({
    id: nanoid(2),
    type: 'Tab',
    title: name,
    layout: { rows: 1, cols: 1 },
    items: [],
  }),
  createContainer = (type) => {
    const res = Object.assign(
      { type, items: [], id: nanoid(4) },
      Object.fromEntries(
        getProps(type).map((e) => [e, allProps[e].initial])
      )
    );
    if (res.title) res.title = `${type} ${res.title}`;

    if (type === 'Tabs') {
      res.tabs = [...Array(3)].map((e, i) =>
        createTab(`Tab${i + 1}`)
      );
    }
    return res;
  },
  getComponent = (type) => {
    const res = Object.assign(
      {
        type,
        id: nanoid(4),
      },
      Object.fromEntries(
        getProps(type).map((e) => [
          e,
          allProps[e].component === 'Checkbox'
            ? false
            : allProps[e].initial,
        ])
      )
    );

    return res;
  };

const toIdObjects = (src, exclude = []) =>
  Object.keys(src)
    .filter((k) => !exclude.includes(k))
    .map((k) => ({ id: k, label: src[k].name || k }));
export const elements = {
  containers: toIdObjects(containers, ['Form', 'Tab']),
  components: toIdObjects(components),
};
export const createItem = (type, loc) => {
  const elem = containers[type]
    ? createContainer(type)
    : getComponent(type);
  if (loc) elem.loc = loc;

  return elem;
};
