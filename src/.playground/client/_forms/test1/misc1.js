import React from 'react';
import components from '@app/components/formics';

const { Formit, RefTable, SimpleTable, calc } = components;
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
    <RefTable
      dataid="k27"
      refs="k28"
      bound="Person"
      title="Wellbores"
      loc={{ row: 2, col: 1, colSpan: 2 }}
      columns={[
        { title: 'First name', id: 'first' },
        { title: 'Last name', id: 'last' },
        { title: 'Info', id: 'comment' },
      ]}
    />
    <SimpleTable
      dataid="k28"
      title="Wellbores"
      loc={{ row: 3, col: 1, colSpan: 3 }}
      bound="Person"
      movable
      selection="single"
      height="40rem"
      columns={[
        { title: 'First name', id: 'first' },
        { title: 'Last name', id: 'last' },
        { title: 'Info', id: 'comment' },
      ]}
    />
  </Formit>
);

export default Form;
