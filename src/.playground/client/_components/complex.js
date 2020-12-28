import React from 'react';
import formics from '@app/components/formics';

const { Checkbox } = formics;
export default (root) => {
  const basic = root.addGroup('Basic');
  basic
    .addStory(
      'Switches',
      {}, //model, schema, lookups
      { flex: 'row', useCards: true }
    ) //, col: 3
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
        />
      );
    });
};
