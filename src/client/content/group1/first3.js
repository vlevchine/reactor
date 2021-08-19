import { useState } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
import { process } from '@app/utils/immutable';
import FormEditor from '@app/components/formEditor';
import Form from '@app/components/formit';
import { Button, Tabs, EditableText } from '@app/components/core';
import { BasicTable } from '@app/components';
import '@app/content/styles.css';

export const config = {
  domain: 'entity',
  name: 'persons',
  valueType: 'Person',
};

const typeMap = {
  TextInput: 'String',
  NumberInput: 'Float',
  DateInput: 'DateTime',
  Checkbox: 'Boolean',
  Select: 'ID',
  Radio: 'ID',
  Cascade: 'ID',
  MultiSelect: '[ID]',
  TagGroup: '[ID]',
  TextArea: 'String',
};
function collectTypes(items, res) {
  items.forEach((e) => {
    if (e.items) {
      collectTypes(e.items, res);
    } else {
      if (e.dataid)
        res.push({ name: e.dataid, type: typeMap[e.type] });
    }
  });
  return res;
}
function toGraphqlSchema(def) {
  const items = collectTypes(def.items, [
    { name: 'id', type: 'ID' },
    { name: 'createdAt', type: 'DateTime' },
    { name: 'updatedAt', type: 'DateTime' },
    { name: 'json', type: 'JSON' },
  ]);
  return `type ${
    def.dataType
  } implements Entity @entity(name: "<entityName>") {
    ${items.map((e) => `${e.name}: ${e.type}`).join('\r\n\t')}
  }`;
}

const kinds = ['currency', 'percent', 'height', 'length', 'weight'],
  types = ['String', 'Int', 'Float', 'Boolean', 'Date', 'ID', 'Geo'];
const form0 = {
  type: 'Form',
  id: 'sample',
  layout: { cols: 2, rows: 5 },
  title: 'Sample Form',
  context: (v, ctx) => ({
    isSteven: v.first === 'Steven',
    isGeologist: ctx.user?.roles.includes('geologist'),
  }),
  items: [
    {
      type: 'NumberInput',
      id: '_1',
      dataid: 'age',
      loc: { row: 4, col: 1 },
      // prepend: 'user',
      // append: 'cog',
      label: 'Age',
    },
    {
      type: 'Section',
      // hide: 'isGeologist',
      id: 'sec1',
      title: 'Section #AAA',
      loc: { row: 2, col: 1, colSpan: 2 },
      layout: { cols: 4, rows: 2 },
      items: [
        {
          type: 'TextInput',
          id: '_1',
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
          id: '_2',
          type: 'RawHtml',
          loc: { row: 2, col: 3 },
          column: {},
          style: 'color: red; background-color: var(--g-10)',
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
          id: '_3',
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
          id: '_4',
          dataid: 'height',
          loc: { row: 2, col: 1 },
          clear: true,
          prepend: 'user',
          label: 'Person height',
        },
        {
          type: 'Select',
          id: '_5',
          dataid: 'film',
          loc: { row: 2, col: 2 },
          label: 'Select Movie',
          prepend: 'user',
          clear: true,
          search: true,
          //disabled
          intent: 'danger',
          filterBy: 'title',
          message: 'Not nice error',
          display: (t) => `${t.title} - ${t.year}`,
        },
        {
          type: 'TagGroup',
          dataid: 'films',
          id: '_6',
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
          id: '_7',
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
          id: '_1',
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
          id: '_2',
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
          id: '_3',
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
          id: '_8',
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
          id: '_9',
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
      type: 'TabPanel',
      id: 'tabLis',
      horizontal: true,
      loc: { row: 1, col: 1, colSpan: 2 },
      items: [
        {
          type: 'Tab',
          //   disable:'isSteven',
          id: '_1',
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
          // hide: 'isGeologist',
          id: '_2',
          scope: 'address',
          title: 'Second',
          layout: { rows: 2, cols: 1 },
          items: [
            {
              type: 'TextInput',
              id: '_1',
              dataid: 'city',
              prepend: 'tint',
              intent: 'warning',
              label: 'Label two',
              loc: { row: 1, col: 1 },
            },
          ],
        },
        {
          type: 'Tab',
          id: '_3',
          title: 'Third',
          layout: { rows: 4, cols: 1 },
          items: [
            {
              type: 'TextArea',
              id: '_1',
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
form0.schema = toGraphqlSchema(form0);
const propColumns = [
    {
      title: 'Id',
      id: 'name',
    },
    {
      title: 'Type',
      id: 'type',
      use: 'Select',
      options: types,
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
    { title: 'Ref', id: 'ref' },
    {
      title: 'Unit type',
      id: 'unit',
      use: 'Select',
      options: kinds,
    },
  ],
  entityFields = [
    { name: 'id', type: 'ID' },
    { name: 'createdAt', type: 'DateTime' },
    { name: 'updatedAt', type: 'DateTime' },
    { name: 'json', type: 'JSON' },
  ];
console.log(entityFields);
//Display/edit item details - <First3>
const First3 = ({ def, ...rest }) => {
  const query = def.dataQuery[0],
    [form, setForm] = useState(form0),
    [types, setTypes] = useState(() => [
      {
        id: 'entity',
        name: 'Person',
        fields: [
          {
            id: 'first',
            name: 'first',
            type: 'String',
            required: true,
          },
          {
            id: 'film',
            name: 'film',
            type: 'Int',
            multi: true,
            ref: 'films',
            unit: 'height',
          },
        ],
      },
    ]),
    entityType = _.first(types),
    onChange = (msg, frm) => {
      const [updated] = process(form || frm, msg);
      setForm(updated);
    },
    addType = () => {
      setTypes([
        ...types,
        {
          id: nanoid(4),
          name: '',
          fields: [],
        },
      ]);
    },
    onNameChange = (name, id, done) => {
      if (done?.accept) {
        const ind = types.findIndex((e) => e.id === id),
          v = { ...types[ind], name };
        setTypes(_.replace(types, ind, v));
      }
    },
    onEdit = (v, id, op) => {
      let ind, fields;
      if (op === 'add') {
        ind = types.findIndex((e) => e.id === id);
        fields = types[ind].fields;
        v.id = nanoid(4);
        fields[fields.length - 1] = v;
      } else if (op === 'remove') {
        ind = types.findIndex((e) => e.id === id);
        const field = types[ind].fields.find((f) => f.id === v);
        fields = _.safeRemove(types[ind].fields, field);
      } else if (op === 'update') {
        const [t_id, p_id] = id.split('.');
        ind = types.findIndex((e) => e.id === t_id);
        const f_ind = types[ind].fields.findIndex(
          (f) => f.id === p_id
        );
        fields = _.replace(types[ind].fields, f_ind, v);
      }
      setTypes(_.replace(types, ind, { ...types[ind], fields }));
    };

  return (
    <Tabs selected="preview">
      <Tabs.Tab id="design" name="Design">
        <FormEditor
          def={form}
          onChange={onChange}
          boundTo={query.name || query.alias}
          {...rest}
        />
      </Tabs.Tab>
      <Tabs.Tab id="preview" name="Preview">
        <Form
          {...rest}
          def={form}
          boundTo={query.name || query.alias}
        />
      </Tabs.Tab>
      <Tabs.Tab id="schema" name="Schema">
        <div style={{ display: 'flex', marginTop: '0.5rem' }}>
          <div style={{ width: '48%' }}>
            <div style={{ display: 'flex' }}>
              <h6>Form model Type schema</h6>
              <EditableText
                style={{ margin: '-0.125rem 0 0 1rem' }}
                value={entityType.name}
                id={entityType.id}
                onChange={onNameChange}
                placeholder="Type name here..."
              />
            </div>
            <BasicTable
              value={entityType.fields}
              dataid={entityType.id}
              canAdd
              editable
              onChange={onEdit}
              disabled={!entityType.name}
              columns={propColumns}
            />
          </div>
          <div style={{ width: '48%', marginLeft: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <h6>Additional types</h6>
              <Button
                prepend="plus"
                text="Add Type"
                size="md"
                className="muted invert"
                onClick={addType}
              />
            </div>
            {_.tail(types).map((e) => (
              <div key={e.id}>
                <EditableText
                  style={{ margin: '-0.125rem 0 0 1rem' }}
                  value={e.name}
                  id={e.id}
                  onChange={onNameChange}
                  placeholder="Type name here..."
                />
                <BasicTable
                  dataid={e.id}
                  value={e.fields}
                  idField="name"
                  canAdd
                  editable
                  onChange={onEdit}
                  disabled={!e.name}
                  columns={propColumns}
                />
              </div>
            ))}
          </div>
        </div>
      </Tabs.Tab>
    </Tabs>
  );
};

First3.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  cached: PropTypes.object,
  className: PropTypes.string,
};

export default First3;
