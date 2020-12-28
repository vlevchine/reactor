import React from 'react';
import { fake } from '../utils';
import formics from '@app/components/formics';

//prettier-ignore
const { Button,  Checkbox, Switch, Input, InputGroup, TextArea, Select } = formics;
const model = { a: 'first', b: 'second', c: 'third', e: true };

const options = fake.arrayOf(
  [
    { name: 'label' },
    { name: 'id', auto: true },
    { name: 'key', auto: true },
  ],
  4
);
export default (root) => {
  const basic = root.addGroup('Basic'),
    other = root.addGroup('Other');

  basic
    .addStory('Buttons', {}, { flex: 'row', useCards: true })
    .add('standard', (props) => (
      <Button {...props} text="Hello, you" intent="none" />
    ))
    .add('standard / danger', (props) => (
      <Button {...props} text="Hello, you" intent="danger" />
    ))
    .add('minimal / bordered', (props) => (
      <Button {...props} minimal={true} intent="none" border={true} />
    ))
    .add('minimal / non-bordered', (props) => (
      <Button
        {...props}
        text="Hi, again"
        minimal={true}
        border={false}
        intent="none"
      />
    ));

  basic
    .addStory('Inputs', { model }, { flex: 'row', useCards: true })
    .add('Input', (props) => <Input {...props} round={true} />)
    .add('InputGroup', (props) => (
      <InputGroup
        {...props}
        leftIcon="filter"
        placeholder="Filtering..."
      />
    ))
    .add('TextArea', (props) => (
      <TextArea
        {...props}
        rows={4}
        cols={16}
        placeholder="Filtering..."
      />
    ))
    .add('TextArea - no cols', (props) => (
      <TextArea {...props} rows={4} placeholder="Filtering..." />
    ));

  basic
    .addStory('Switches', null, { flex: 'row', useCards: true })
    .add('checkbox / 3 state', (props) => {
      return (
        <Checkbox {...props} label="checkbox" undeterminable={true} />
      );
    })
    .add('checkbox / 2 state', (props) => {
      return (
        <Checkbox
          {...props}
          label="checkbox"
          undeterminable={false}
          indicatorOnRight={true}
        />
      );
    })
    .add('switch', (props) => {
      return (
        <Switch
          {...props}
          label="switch"
          labelOn="On"
          labelOff="Off"
        />
      );
    });

  basic
    .addStory('Selects', { model }, { flex: 'row', useCards: true })
    .add('Small select', (props) => {
      return <Select {...props} minimal={true} options={options} />;
    })
    .add('Border select', (props) => {
      return <Select {...props} options={options} intent="warning" />;
    });
  // .add('Radio group', 'basic.Radio', {
  //   label: 'This is Radio group',
  //   options: options,
  // });

  other.addStory('Inputs', {}, { flex: 'row', useCards: true });
  // .add('input', (props) => {
  //   return (
  //     <FormGroup
  //       label="Filter label"
  //       labelInfo="(required field)"
  //       helperText="help"
  //       inline={false}>
  //       {(props1) => (
  //         <InputGroup
  //           {...props}
  //           {...props1}
  //           leftIcon="filter"
  //           placeholder="Filtering..."
  //         />
  //       )}
  //     </FormGroup>
  //   );
  // });
};
// <Button>
//   <span role="img" aria-label="so cool">
//     😀 😎 👍 💯
//   </span>
// </Button>
