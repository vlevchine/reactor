import React from 'react';
import { fake } from '../utils';
import { FormGroup } from '@app/components';
import formics from '@app/components/formics';

const { Checkbox, InputGroup } = formics;
//const { FormGroup } = comps;
const options = fake.arrayOf(
  [{ name: 'label' }, { name: 'value', auto: true }],
  4
);
export default (storyOf) => {
  storyOf('Components', 'elementor')
    .addGroup('Basic')
    .addStory('Buttons')
    .add('standard', 'basic.Button', {
      text: 'Hello, you',
      intent: 'none',
    })
    .add('standard / danger', 'basic.Button', {
      text: 'Hello, you',
      intent: 'danger',
    })
    .add('minimal / bordered', 'basic.Button', {
      text: 'Hello, you',
      minimal: true,
      border: true,
      intent: 'none',
    })
    .add('minimal / non-bordered', 'basic.Button', {
      text: 'Hello, you',
      minimal: true,
      border: false,
      intent: 'none',
    });
  storyOf('Components')
    .addGroup('Basic')
    .addStory('Inputs', { a: 'first', b: 'second', c: 'third' })
    .add('standard', 'basic.Input', { id: 'a', round: true })
    .add('grouped', 'basic.InputGroup', {
      id: 'b',
      leftIcon: 'filter',
      placeholder: 'Filtering...',
    })
    .add('text area', 'basic.TextArea', {
      id: 'c',
      rows: 4,
      cols: 16,
      placeholder: 'Filtering...',
    });
  storyOf('Components')
    .addGroup('Basic')
    .addStory('Switches')
    .add('checkbox / 3 state', (props) => {
      return (
        <Checkbox {...props} label="checkbox" undeterminable={true} />
      );
    })
    .add('checkbox / 2 state', 'basic.Checkbox', {
      label: 'checkbox',
      undeterminable: false,
      indicatorOnRight: true,
    })
    .add('switch', 'basic.Switch', {
      label: 'switch',
      labelOn: 'On',
      labelOff: 'Off',
    });
  storyOf('Components')
    .addGroup('Basic')
    .addStory('Selects')
    .add('simple select', 'basic.Select', {
      minimal: true,
      options: options,
    })
    .add('simple select / large', 'basic.Select', {
      intent: 'warning',
      size: 'large',
      minimal: true,
      options: options,
    })
    .add('Radio group', 'basic.Radio', {
      label: 'This is Radio group',
      options: options,
    });
  storyOf('Components')
    .addGroup('Form groups')
    .addStory('Inputs')
    .add('input', (props) => {
      return (
        <FormGroup
          label="Filter label"
          labelInfo="(required field)"
          helperText="help"
          inline={false}>
          {(props1) => (
            <InputGroup
              {...props}
              {...props1}
              leftIcon="filter"
              placeholder="Filtering..."
            />
          )}
        </FormGroup>
      );
    });
};
// <Button>
//   <span role="img" aria-label="so cool">
//     😀 😎 👍 💯
//   </span>
// </Button>
