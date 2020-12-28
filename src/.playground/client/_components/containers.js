import React from 'react';

let model, schema, lookups;

export default (root) => {
  const basic = root.addGroup('Basic');
  basic.addStory(
    'Switches',
    { model, schema, lookups },
    { flex: 'row', useCards: false }
  );
};
