import addonSchema from './tabs.graphql.json';
import React from 'react';
import components from '@app/components/formics';
//prettier-ignore
const { Formit, Field, Section, Button, Tabs, DateInput, Input, InputGroup, InputMask,
 Switch, Radio, calc } = components;

const Form = (props) => (
  <Formit
    {...props}
    queryTypes={['Test']}
    addonSchema={addonSchema}
    id="testForm"
    title="Form with dependents"
    cols={1}
    //cache={cache}
    context={(m) => ({
      c1: m.k2 === 11,
      c: m.k1 === 'q',
      c5: m.k5,
      cumGain: calc.sum(m, 'k8', 'gain'),
      avgGain: calc.avg(m, 'k8', 'gain'),
    })}>
    <Tabs large={false} vertical={false}>
      <panel title="Tab1" cols={3} bound="Test">
        <Section
          loc={{ col: 1, colSpan: 2 }}
          title="Some title..."
          collapsible={true}
          border={true}
          background="#fff">
          <Switch
            dataid="k5"
            label="another switch"
            labelOn="Onn"
            labelOff="Offf"
          />
          <InputMask dataid="k23" type="LatLon" />
          <p>Card content</p>
        </Section>
      </panel>
      <panel title="Tab2" bound="Test">
        <Field
          loc={{ row: 1, col: 1 }}
          intent="warning"
          labels={{
            helperText: 'Helper here...',
            label: 'Label here',
            labelInfo: '(required?)',
          }}>
          <DateInput dataid="k4" />
          <Input dataid="k1" intent="danger" />
          <Input dataid="k3" round={true} style={{ color: 'red' }} />
          <InputGroup
            dataid="k1"
            hidden={(ctx) => ctx.c1}
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
            prefix="more"
            minimal={false}
            on="hover"
          />
          <Switch
            dataid="k5"
            label="it's a switch"
            labelOn="On"
            labelOff="Off"
          />
          <Radio dataid="k7" display="name" />
        </Field>
      </panel>
      <panel title="Tab3" cols={3}>
        <p>Tab content #3</p>
      </panel>
    </Tabs>
  </Formit>
);

export default Form;
