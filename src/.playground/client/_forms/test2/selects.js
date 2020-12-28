import addonSchema from './selects.graphql.json';
import React from 'react';
import components from '@app/components/formics';

const { Formit, Field, Checkbox, Select, Switch, calc } = components;
const Form = (props) => (
  <Formit
    {...props}


    queryTypes={['Test','Tag']}
    addonSchema={addonSchema}
    id="testForm"
    title="My Form..."
    bound="Test"
    cols={2}
    context={(m) => ({
      c1: m.k2 === 11,
      c: m.k1 === 'q',
      c5: m.k5,
      cumGain: calc.sum(m, 'k8', 'gain'),
      avgGain: calc.avg(m, 'k8', 'gain'),
    })}>
    <Select
      dataid="k25"
      loc={{ row: 1, col: 1 }}
      //bound="k25"
      filterBy="title"
      rightLabel="rank"
      display={(item) => `${item.name}`}
      size="large"
      minimal={false}
    />
    <Select
      dataid="k26"
      loc={{ row: 1, col: 2 }}
      filterBy="title"
      rightLabel="rank"
      display="name"
      size="large"
      minimal={false}
    />
    <Field
      cols={1}
      loc={{ row: 2, col: 1 }}
      labels={{
        helper: 'Helper text with details...',
        label: 'Label AAA',
        info: '(required)',
      }}>
      <Checkbox dataid="k6" label="checkbox!" undeterminable={true} />
      <Select
        dataid="k7"
        options="users"
        intent="danger"
        rightLabel="last"
        display="name"
        size="small"
        minimal={false}
      />
      <Select
        dataid="k9"
        //options={Films}
        multi={true}
        minimal={true}
        filterBy="title"
        rightLabel="rank"
        display={(item) => `${item.title}, ${item.year}`}
      />
    </Field>
    <Switch
      loc={{ row: 2, col: 2 }}
      dataid="k5"
      label="it's a switch"
      labelOn="On"
      labelOff="Off"
    />
  </Formit>
);

export default Form;
