import { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { process } from '@app/utils/immutable';
import { _ } from '@app/helpers';
import {
  Button,
  Dropdown,
  Accordion,
  EditableText,
  Checkbox,
  TextArea,
} from '@app/components/core';
import Form from '@app/components/formit';
import '@app/content/styles.css';

const form0 = {
  type: 'Form',
  id: 'sample',
  layout: { cols: 2, rows: 5 },
  title: 'Sample Form',
  context: (v, roles) => ({
    isSteven: v.first === 'Steven',
    isGeologist: roles.includes('geologist'),
  }),
  items: [
    {
      type: 'TextInput',
      id: '1',
      dataid: 'first',
      loc: { row: 1, col: 1 },
      prepend: 'user',
      append: 'cog',
      label: 'First name 1',
    },
    {
      type: 'Section',
      hide: (s) => !s.isGeologist,
      id: 'sec1',
      title: 'Section #AAA',
      loc: { row: 2, col: 1, colSpan: 2 },
      layout: { cols: 4, rows: 2 },
      items: [
        {
          type: 'TextInput',
          id: '1',
          dataid: 'email',
          loc: { row: 1, col: 1 },
          intent: 'danger',
          clear: true,
          prepend: 'user',
          append: 'cog',
          label: 'E-mail',
          message: 'Success here...',
        },
        {
          id: '2',
          type: 'RawHtml',
          loc: { row: 2, col: 3 },
          column: {},
          style: 'color: red; background-color: var(--g-12)',
          inner: `<h4 style="color: blue;">HTML cell</h4>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore
                      magna aliqua. Ut enim ad minim veniam, quis nostrud
                      exercitation ullamco laboris nisi ut aliquip ex ea
                      commodo consequat.
                    </p>`,
        },
        {
          type: 'TextInput',
          id: '3',
          dataid: 'first',
          loc: { row: 1, col: 2 },
          clear: true,
          prepend: 'cogs',
          appendType: 'text',
          append: 'm',
          label: 'First name',
          //message: 'Testing it',
        },
        {
          type: 'NumberInput',
          id: '4',
          dataid: 'height',
          loc: { row: 2, col: 1 },
          clear: true,
          prepend: 'user',
          label: 'Person height',
        },
        {
          type: 'Select',
          id: '5',
          dataid: 'film',
          loc: { row: 2, col: 2 },
          label: 'Select Movie',
          prepend: 'user',
          clear: true,
          search: true,
          //disabled
          //intent: 'danger',
          filterBy: 'title',
          message: 'Not nice error',
          display: (t) => `${t.title} - ${t.year}`,
        },
        {
          type: 'TagGroup',
          dataid: 'films',
          id: '6',
          loc: { row: 1, col: 3 },
          clear: true,
          prepend: 'user',
          display: 'title',
          //intent: 'warning',
          tagIntent: 'success',
          initials: true,
          editable: true,
          label: 'Label here',
        },
        {
          type: 'DateInput',
          dataid: 'release',
          id: '7',
          loc: { row: 2, col: 4 },
          clear: true,
          // intent: 'success',
          prepend: 'user',
          label: 'Date input',
          // error: 'Warning...',
        },
      ],
    },
    {
      type: 'Panel',
      id: 'panel1',
      title: 'Section #AAA',
      loc: { row: 3, col: 1, colSpan: 2 },
      layout: { cols: 4, rows: 2 },
      items: [
        {
          type: 'TextInput',
          id: '1',
          dataid: 'last',
          loc: { row: 1, col: 1 },
          clear: true,
          prepend: 'user',
          append: 'tint',
          label: 'Last name',
          message: 'Testing it',
        },
        {
          type: 'Checkbox',
          id: '2',
          dataid: 'active',
          loc: { row: 1, col: 2 },
          toggle: true,
          // intent: 'success',
          label: 'Hello',
          text:
            'A Boolean attribute indicating whether or not this checkbox is checked by default (when the page loads). It does not indicate whether this checkbox is currently checked:',
        },
        {
          type: 'MultiSelect',
          dataid: 'films',
          id: '3',
          loc: { row: 1, col: 3 },
          label: 'Select Movie',
          prepend: 'user',
          //minimal
          initials: true,
          // intent: 'warning',
          clear: true,
          search: true,
          //filterBy="title"
          // error: 'Not nice error',
          display: (t) => `${t.title}, ${t.year}`,
        },
        {
          type: 'Cascade',
          loc: { row: 2, col: 1, colSpan: 3 },
          id: '8',
          dataid: 'costCenter',
          label: 'Operation',
          labels: ['Cost center', 'Account', 'Sub-Account'],
          display: (t) => t.name,
          //minimal
          horizontal: true,
          prepend: 'user',
          clear: true,
          search: true,
          filterBy: 'title',
        },
        //         {
        //           component: 'Info',
        //           loc: { col: 4, row: 1 },
        //           text: 'Select Movies',
        //         },
        {
          type: 'TextArea',
          id: '9',
          dataid: 'comment',
          loc: { row: 2, col: 4 },
          // intent: 'success',
          label: 'Comment',
          clear: true,
          rows: '5',
        },
      ],
    },
    {
      type: 'Tabs',
      id: 'tabLis',
      title: 'Tabs',
      horizontal: true,
      loc: { row: 4, col: 1, colSpan: 2 },
      items: [
        {
          type: 'Tab',
          //   disable: (s) => s.isSteven,
          id: '1',
          title: 'First',
          layout: { rows: 2, cols: 2 },
          items: [
            {
              type: 'Radio',
              id: 'film1',
              dataid: 'film',
              loc: { row: 1, col: 1 },
              label: 'Select Movie',
              display: (t) => t.title,
            },
          ],
        },
        {
          type: 'Tab',
          // hide: (s) => s.isGeologist,
          id: '2',
          title: 'Second',
          layout: { rows: 2, cols: 1 },
          items: [
            {
              type: 'TextInput',
              id: '1',
              dataid: 'first',
              prepend: 'times',
              intent: 'warning',
              label: 'Label two',
              loc: { row: 1, col: 1 },
            },
          ],
        },
        {
          type: 'Tab',
          id: '3',
          title: 'Third',
          layout: { rows: 4, cols: 1 },
          items: [
            {
              type: 'TextArea',
              id: '1',
              dataid: 'comment',
              loc: { row: 1, col: 1, colSpan: 2 },
              intent: 'success',
              label: 'Comment',
              debounce: 600,
              clear: true,
              rows: '5',
            },
          ],
        },
      ],
    },
  ],
};
const parseObjectProp = (pr1, pr2) => (str, e) => {
    const [ind, span] = str.split('/').map(Number);
    return {
      loc: Object.assign(e.loc, {
        [pr1]: ind || 1,
        [pr2]: span || 1,
      }),
    };
  },
  allProps = {
    column: {
      initial: { col: 1, colSpan: 1 },
      label: 'Column / Span',
      asString: ($, val) => {
        const { col, colSpan = 1 } = val.loc;
        return `${col} / ${colSpan}`;
      },
      parse: parseObjectProp('col', 'colSpan'),
    },
    row: {
      initial: { row: 1, rowSpan: 1 },
      label: 'Row / Span',
      asString: ($, val) => {
        const { row, rowSpan = 1 } = val.loc;
        return `${row} / ${rowSpan}`;
      },
      parse: parseObjectProp('row', 'rowSpan'),
    },
    layout: {
      initial: { rows: 1, cols: 1 },
      label: 'Columns / Rows',
      asString: ({ rows, cols }) => `${cols} / ${rows}`,
      parse: (str) => {
        const [c, r] = str.split('/').map(Number);
        return { rows: r || 1, cols: c || 1 };
      },
    },
    title: { initial: 'Title', label: 'Title' },
    label: { initial: 'Label', label: 'Label' },
    display: {
      initial: 'label',
      label: 'Display',
      asString: (f) => {
        return f.toString();
      },
      parse: (f) => (f.includes('=>') ? eval(f) : f),
    },
    dataid: { initial: 'id', label: 'Data id' },
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
    clear: { label: "'Clear' Button'", component: Checkbox },
    minimal: { label: 'Minimal', component: Checkbox },
    search: { label: 'Search', component: Checkbox },
    editable: { label: 'Editiable', component: Checkbox },
    initials: { label: 'Use initials', component: Checkbox },
    horizontal: { label: 'Horizontal', component: Checkbox },
  };
const cont_common = ['title', 'layout'],
  loc = ['row', 'column'],
  common = [
    'label',
    'dataid',
    'prepend',
    'append',
    'appendType',
    'clear',
    'minimal',
    'message',
    'style',
  ],
  containers = [
    { id: 'Section' },
    { id: 'Panel' },
    { id: 'Tabs' },
    { id: 'Tab' },
  ],
  forbid = {
    Form: ['Tab'],
    Section: ['Tab'],
    Panel: ['Tab'],
    Tabs: ['Section', 'Panel', 'Tabs'],
  },
  containerTypes = ['Form', ...containers.map((e) => e.id)],
  components = {
    TextInput: [],
    NumberInput: [],
    DateInput: [],
    Select: ['search', 'filterBy', 'display'], //
    MultiSelect: ['search', 'filterBy', 'display'],
    TagGroup: ['tagIntent', 'initials', 'editable'],
    Checkbox: ['text'],
    Radio: [],
    Cascade: ['labels', 'horizontal'],
    TextArea: ['rows'],
    RawHtml: ['inner'],
  },
  componentTypes = Object.keys(components).map((id) => ({ id })),
  getProps = (type) => {
    const isContainer = containerTypes.includes(type);
    if (isContainer)
      return type === 'Form' || type === 'Tab'
        ? cont_common
        : [...cont_common, ...loc];
    return [...loc, ...common, ...components[type]];
  };

const getContainer = (type) => {
    const res = Object.assign(
      { type, items: [], id: nanoid(4) },
      Object.fromEntries(
        getProps(type).map((e) => [e, allProps[e].initial])
      )
    );
    if (res.title) res.title = `${type} ${res.title}`;

    if (type === 'Tabs') {
      res.tabs = [...Array(3)].map((e, i) => ({
        id: nanoid(2),
        title: `Tab${i + 1}`,
        items: [],
      }));
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
          allProps[e].initial ||
            (allProps[e].component === 'Checkbox' ? false : ''),
        ])
      )
    );

    return res;
  },
  containerIcon = (t) =>
    containerTypes.includes(t) ? 'brackets' : 'code',
  // displayValue = (k, item) => {
  //   var fn = allProps[k].asString || _.identity;
  //   return fn(item[k]);
  // },
  findComponent = (obj, id, def_val) =>
    id ? _.getIn(obj, _.insertBetween(id, 'items')) : def_val;
//Display/edit item details - <First3>
const First3 = ({ def, ...rest }) => {
  const query = def.dataQuery[0],
    [form, setForm] = useState([form0 || getContainer('Form')]),
    [selected, select] = useState(form[0].id),
    onSelect = (a, id) => {
      select(id);
    },
    add = (type) => {
      const value = containerTypes.includes(type)
          ? getContainer(type)
          : getComponent(type),
        [updated] = process(form, {
          op: 'add',
          path: _.insertRight(selected, 'items'),
          value,
        });
      setForm(updated);
    },
    onRemove = () => {
      const [root, value] = selected.split('.'),
        [updated] = process(form, {
          op: 'remove',
          path: _.insertRight(root, 'items'),
          value,
        });
      setForm(updated);
    },
    onPropChanged = (v, prop, done) => {
      if (done === false) return;
      if (prop === 'row') {
        console.log(selectedItem['column']);
      }
      const fn = allProps[prop].parse || _.identity;
      const [updated] = process(form, {
        op: 'update',
        path: _.insertBetween(selected, 'items'),
        value: { [prop]: fn(v, selectedItem) },
      });
      setForm(updated);
    },
    selectedItem = findComponent(form, selected, form[0]),
    containerSelected = containerTypes.includes(selectedItem?.type);

  return (
    <div className="editor">
      <div className="edit-toolbar">
        <h5>{form[0].title}</h5>
        <div>
          <Dropdown
            prepend="brackets"
            arrow
            hover
            options={containers}
            action={add}
            disabled={
              !containerSelected || selectedItem?.type === 'Tab'
            }
            disableOptions={containers.map((c) =>
              forbid[selectedItem?.type]?.includes(c.id)
            )}
          />
          <Dropdown
            prepend="code"
            arrow
            hover
            options={componentTypes}
            action={add}
            disabled={!containerSelected}
          />
          <Button
            className="clip-icon before close btn-invert"
            text="Remove"
            style={{ ['--color']: 'var(--danger-d)' }}
            disabled={selected === form[0].id}
            onClick={onRemove}
          />
        </div>
      </div>
      <div className="edit-tree">
        <h6>Elements</h6>
        <Accordion
          items={form}
          onSelect={onSelect}
          expandAll
          selected={selected}
          selectedClass="selected"
          spec={{
            items: 'items',
            iconExpand: true,
            id: (e) => `${e.row.row}_${e.column.col}`,
            label: ({ type, loc }) =>
              type === 'Tab' || type === 'Form'
                ? type
                : `${type}${` - [${loc?.row},${loc?.col}]`}`,
            icon: (e) => containerIcon(e.type),
          }}
        />
      </div>
      <div className="edit-props">
        <h6>Props</h6>
        {selectedItem ? (
          <div className="props-editor">
            {getProps(selectedItem.type).map((k) => {
              const Comp = allProps[k].component || EditableText,
                val = selectedItem[k],
                value =
                  allProps[k].asString?.(val, selectedItem) || val;
              return (
                <Fragment key={k}>
                  <span>{allProps[k].label}</span>
                  <span className="prop-value">
                    <Comp
                      id={k}
                      toggle
                      value={value}
                      onChange={onPropChanged}
                      height="1.125rem"
                      placeholder="<Property value>"
                    />
                  </span>
                </Fragment>
              );
            })}
          </div>
        ) : (
          <div>Select element in tree above</div>
        )}
      </div>
      <div className="edit-preview">
        <Form
          layout={{ cols: 1, rows: 5 }}
          {...rest}
          def={form[0]}
          boundTo={query.name || query.alias}
        />
      </div>
    </div>
  );
};

First3.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  cached: PropTypes.object,
  cache: PropTypes.object,
  store: PropTypes.object,
  className: PropTypes.string,
};

export default First3;
