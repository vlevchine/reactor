import React from 'react';
import components from '@app/components/formics';

const { Formit, Hierarchy, HierTable, calc } = components;
const Form = (props) => (
  <Formit
    {...props}
    queryTypes={['Test']}
    addonSchema={null}
    id="testForm"
    title="My Form..."
    bound="Test"
    cols={3}
    rows={'auto 1fr'}
    context={(m) => ({
      c1: m.k2 === 11,
      c: m.k1 === 'q',
      c5: m.k5,
      cumGain: calc.sum(m, 'k8', 'gain'),
      avgGain: calc.avg(m, 'k8', 'gain'),
    })}>
    {/* <Hierarchy dataid="k29" loc={{ row: 1, col: 1, colSpan: 3 }} /> */}
    <HierTable
      dataid="k29a"
      loc={{ row: 1, col: 1, colSpan: 3 }}
      title="Chart of accounts"
      levels={[
        {
          id: 'cc',
          title: 'Cost centers',
          columns: ['name', 'code', 'inactive'],
        },
        {
          id: 'ca',
          title: 'Cost accounts',
          span: 2,
          columns: ['name', 'code', 'description'],
          // [
          //   { id: 'name', title: 'Name', type: 'String' },
          //   { id: 'code', title: 'Code', type: 'String' },
          //   {
          //     id: 'inactive',
          //     title: 'Deactive',
          //     type: 'Boolean',
          //     showNull: false,
          //   },
          // ],
        },
      ]}
    />
  </Formit>
);

export default Form;
