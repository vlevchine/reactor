import React from 'react';
import formics from '@app/components/formics';

const { Checkbox } = formics;
const users = [
    { id: 1, name: 'Jeremy Clarkson' },
    { id: 2, name: 'James May' },
    { id: 3, name: 'Richard Hammond' },
  ],
  Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
  ].map((e, i) => ({ ...e, rank: i, id: i + 1, key: i.toString() })),
  lookups = { lookups: { Films }, users };
const schema = `
  type Film {
    title: String
    year: Int
    rank: Int
    id: Int
    key: String
  }
  type Lookups {
    Films: [Film]
  }
  type Tag {
    text: String @mock(any: "hey, hello")
    color: String @mock(faker: "internet.color")
    reason: Reason
    name: String,
    date: Date,
    note: String @kind(type: "text")
  }
  type Reason {
    name: String
  }
  """output"""
  type Person {
    first: String @mock(faker: "name.firstName")
    last: String @mock(faker: "name.lastName")
    name: String @resolve(func: "%{first} %{last}")
    age: Int @mock(between: "1,102")
    rate: Float @mock(between: "10000, 33000")
    active: Boolean
    gain: Float @kind(type: "percent")
    tag: Tag
    release: Date
    assigned: [Ref] @to(prop: "users")
    film: Ref @to(lookups: "Films")
    films: [Ref] @to(lookups: "Films") 
  }
  scalar Array
  type PageResult {
    count: Int
    page: Int
    nodes: Array
  }
  type Test {
    k1: String
    k2: Float @kind(type: "length")
    k3: String
    k4: Date
    k5: Boolean
    k6: Boolean
    k7: Ref @to(lookups: "Films")
    k8: PageResult @of(type: "Person")
    k9: [Ref] @to(lookups: "Films")
  }
`;
const model = {
  k1: 'qwe',
  k2: 12,
  k3: 'test title',
  k4: new Date(),
  k5: true,
  k7: 2,
  k8: {
    count: 21,
    page: 0,
    nodes: [
      {
        id: '1',
        first: 'John',
        last: 'Lennon',
        films: [2, 5],
        tag: {
          text: 'VL',
          color: 'red',
          date: new Date(),
          note:
            'The European languages are members of the same family. Their separate existence is a myth. For science, music, sport, etc, Europe uses the same vocabulary.',
        },
        active: true,
        release: new Date(),
        tags: [
          {
            text: 'VL',
            color: 'red',
          },
          {
            text: 'SG',
            color: 'darkblue',
          },
        ],
        assigned: [1],
      },
      {
        id: '2',
        first: 'Paul',
        last: 'McCartney',
        gain: 0.245608654,
        films: [4],
        active: false,
        tag: {
          text: 'TM',
          color: 'green',
          date: new Date(),
          note:
            'he wise man therefore always holds in these matters to this principle of selection: ',
        },
        tags: [
          {
            text: 'TM',
            color: 'green',
            date: new Date(),
          },
        ],
        assigned: [1, 2, 3],
      },
    ],
  },
  k9: [1],
};

export default (storyOf) => {
  storyOf('UI', 'uikit')
    .addGroup('Basic')
    .addStory('Switches', { model, schema, lookups }, { flex: 'row' }) //, col: 3
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

{
  /* single element unwrapped, no labels //bound="Test"*/
}
{
  /* <Select
  dataid="k7"
  loc={{ row: 1, col: 2 }}
  bound="Test.k7"
  filterBy="title"
  rightLabel="rank"
  display={(item) => `${item.title}, ${item.year}`}
  size="large"
  minimal={false}
/> */
}

{
  /* single element unwrapped, with labels  */
}
{
  /* <Input
  dataid="k3"
  loc={{ row: 1, col: 3 }}
  labels={{
    helper: 'Helper text with details...',
    error: 'This is an error',
    label: 'Label BBB',
    info: "(req'd)",
  }}
  inline={true}
  intent="warning"
  //valid={false}
  style={{ fontWeight: 'bold' }}
/> */
}
