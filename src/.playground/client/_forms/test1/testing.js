import addonSchema from './testing.graphql.json';
import React from 'react';
import components from '@app/components/formics';
//prettier-ignore
const { Formit, Field, Section, Button, Cascader, Checkbox, DateInput, Input, InputGroup, NumericInput,
  Select, Switch,  Text,  Radio, calc } = components;
//Table,TextArea, Tabs, HTML, Card, Dropdown,
const Form = (props) => (
  <Formit
    {...props}
    queryTypes={['Test', 'Tag']}
    addonSchema={addonSchema}
    id="testForm"
    //bound="Test"
    title="Form with dependents"
    cols={3}
    context={(m) => ({
      c1: m.k2 === 11,
      c: m.k1 === 'q',
      c5: !m.k5,
      cumGain: calc.sum(m, 'k8', 'gain'),
      avgGain: calc.avg(m, 'k8', 'gain'),
    })}>
    {/* multiple elements wrapped in Field */}
    <Field
      loc={{ row: 1, col: 1 }}
      intent="warning"
      bound="Test"
      labels={{
        helperText: 'Helper here...',
        label: 'Field bound',
        labelInfo: '(required?)',
      }}>
      <NumericInput
        dataid="k2"
        placeholder="Enter a number..."
        switchUnits={false}
      />
      <Input dataid="k1" intent="danger" />
      <Input dataid="k3" round={true} style={{ color: 'red' }} />
      <InputGroup
        dataid="k1"
        hidden={(ctx) => ctx.c5}
        leftIcon="filter"
        placeholder="Filtering..."
        round={false}
        fill={true}
        size="large"
        style={{ width: '12rem' }}
      />
      <Button
        intent="primary"
        text="btn hello"
        icon="more"
        minimal={false}
        on="hover"
      />
      <Cascader
        dataid="k15"
        display="name"
        items="accounts"
        placeholder="Wait ..."
      />
      <Switch
        dataid="k15"
        label="it's a switch"
        labelOn="On"
        labelOff="Off"
      />
      <Radio dataid="k7" options="users" display="name" />
    </Field>

    {/* single element unwrapped, no labels */}
    <Select
      dataid="k7"
      loc={{ row: 2, col: 2 }}
      bound="Test.k7"
      options="users"
      display="name"
      size="large"
      minimal={false}
      labels={{
        helperText: 'User here',
        error: 'This is an error',
        label: 'User',
        labelInfo: "(req'd)",
      }}
    />
    {/* single element unwrapped, with labels  */}
    <Input
      dataid="k3"
      bound="Test.k3"
      loc={{ row: 2, col: 3 }}
      labels={{
        helper: 'Helper text with details...',
        error: 'This is an error',
        label: 'Label BBB',
        info: "(req'd)",
      }}
      inline={true}
      intent="warning"
      style={{ fontWeight: 'bold' }}
    />
    <Field
      loc={{ row: 1, col: 3 }}
      bound="Test"
      labels={{
        helperText: 'Helper text with details...',
        label: 'Field not bound',
        labelInfo: '(required)',
      }}>
      <Text
        calcid="cumGain"
        tagName="span"
        style={{ color: 'blue' }}
        text={(v) =>
          `You - ${v.toPrecision(
            2
          )} - can change the text in the input below. Hover to see full text. If the text is long enough, then the content will overflow. This is done by setting ellipsize to true.`
        }
      />
      <DateInput dataid="k4" />
      <Input dataid="k3" />
      <Switch
        dataid="k5"
        label="another switch"
        labelOn="On"
        labelOff="Off"
        size="large"
      />
      <Checkbox dataid="k6" label="checkbox!" undeterminable={true} />
      <Select
        dataid="k77"
        bound="Test.k77"
        intent="danger"
        filterBy="title"
        rightLabel="rank"
        display={(e) => `${e.title} - ${e.year}`}
        size="small"
        minimal={false}
      />
      <Select
        dataid="k9"
        bound="k9"
        // multi={true} - no need as it's per schema
        minimal={true}
        filterBy="title"
        rightLabel="rank"
        display={(item) => `${item.title}, ${item.year}`}
      />
      <Select
        dataid="k10"
        minimal={false}
        filterBy="title"
        display={(e) => `${e.title}, ${e.rank}`}
      />
    </Field>
    <Section
      loc={{ row: 3, col: 1, colSpan: 1 }}
      title="Some title..."
      bound="Test"
      collapsible={true}
      border={true}
      background="#fff">
      <Field depends={{ on: 'k8', key: 'tag', dataid: 'k10' }}>
        <DateInput dataid="k4" />
        <Input dataid="k3" />
        <Select
          dataid="k10"
          minimal={false}
          filterBy="title"
          display={(e) => `${e.title}, ${e.rank}`}
        />
      </Field>
    </Section>
    <Section
      loc={{ row: 3, col: 2, colSpan: 1 }}
      title="Some title..."
      collapsible={true}
      border={true}
      background="#fff">
      <Field
        depends={{ on: 'k8', key: 'tag', dataid: 'k10' }}
        bound="Test">
        <NumericInput
          dataid="k2"
          placeholder="Enter a number..."
          switchUnits={false}
        />
        <Select
          dataid="k10"
          minimal={false}
          filterBy="title"
          display={(e) => `${e.title}, ${e.rank}`}
        />
      </Field>
    </Section>
  </Formit>
);

export default Form;
