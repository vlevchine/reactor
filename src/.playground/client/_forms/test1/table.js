import addonSchema from './table.graphql.json';
import React from 'react';
import components from '@app/components/formics';
import { getInitials } from '@app/helpers';

//prettier-ignore
const { Formit, Table, calc } = components;

//1 - Form bound=Test, get type for table by dataid
//2 - Table bound to Person
const Form = (props) => (
  <Formit
    {...props}
    queryTypes={['Person']}
    addonSchema={addonSchema}
    id="testForm"
    title="Form with table"
    bound="Test"
    cols={3}
    context={(m) => ({
      c1: m.k2 === 11,
      c: m.k1 === 'q',
      c5: m.k5,
      cumGain: calc.sum(m, 'k8', 'gain'),
      avgGain: calc.avg(m, 'k8', 'gain'),
    })}>
    <Table
      loc={{ row: 1, col: 1, colSpan: 3 }}
      dataid="k8"
      bound="Person"
      title="Table title..."
      editable={true}
      height="50rem"
      summaryRows={{
        valueCol: 'gain',
        rows: [
          {
            title: 'Summary Gain for today',
            value: (m) =>
              (calc.listSum(m, 'gain') * 100).toFixed(1) + '%',
          },
          {
            title: '  Summary Gain Total',
            value: (m, d) =>
              calc.listSum(m, 'gain', d.page.gainSum).toFixed(3),
          },
        ],
      }}
      columnGroups={[
        { title: 'Name', cols: ['first', 'last', '_1'] },
        { title: 'Total gain', cols: ['gain', 'gain1', 'length'] },
        { title: 'Account info', cols: ['costCenter', 'account'] },
      ]}
      columns={[
        { title: 'First name', id: 'first' },
        { title: 'Last name', id: 'last', hidden: true },
        {
          id: '_1',
          title: 'Full name',
          render: (item, { model }) => (
            <i>
              {model.first} {model.last}
            </i>
          ),
        },
        { title: 'Comment', id: 'comment' },
        {
          title: 'Films',
          id: 'films',
          display: 'title',
          hidden: true,
        },
        {
          title: 'Film',
          id: 'film',
          display: 'title',
          hidden: true,
        },
        { title: 'Length', id: 'length', format: '0.00' },
        { title: 'Gain', id: 'gain', format: '0.0%' },
        {
          title: 'Gain1',
          id: 'gain1',
          dataid: 'gain1',
          render: 'progress',
        },
        { title: 'Release', id: 'release', hidden: true },
        { title: 'Active', id: 'active' },
        {
          title: 'Tag',
          id: 'tag',
          render: (item = {}) => [item.text, item.color].join(', '),
        },
        {
          title: 'Assigned',
          id: 'assigned',
          options: 'users',
          display: (e) => getInitials(e.name),
        },
        {
          title: 'Cost Center',
          id: 'costCenter',
          display: 'name',
        },
        { title: 'Account', id: 'account', display: 'name' },
        {
          title: 'Person data',
          id: 'tags',
          schemaType: 'Tag',
          columns: [
            { title: 'Text', id: 'text' },
            { title: 'Color', id: 'color' },
            { title: 'Song', id: 'song', display: 'title' },
            { title: 'Date', id: 'date' },
            { title: 'Comment', id: 'note' },
          ],
        },
      ]}
      filters={['first', 'length', 'assigned', 'costCenter']}
    />
  </Formit>
);

export default Form;
