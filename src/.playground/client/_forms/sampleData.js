import faker from 'faker';
import { uniq } from 'lodash';
import { init } from '@app/units';
import {
  dateToString,
  stringToDate,
  normalizeDate,
} from '@app/helpers';

const schema = '';
const daysStr = [11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 24, 25, 27]
    .map((e) => new Date(2020, 0, e))
    .map(dateToString),
  days = daysStr.map(stringToDate),
  arrayOfSize = (num = 0) => [...Array(num).keys()],
  uniqueNumbers = (num, opts) =>
    uniq(arrayOfSize(num).map((e) => faker.random.number(opts))),
  uniqueIds = (num, max = 1) =>
    uniqueNumbers(num, { min: 1, max }).map((e) => e.toString()),
  fromArray = (arr = [], num) =>
    uniq(arrayOfSize(num).map((_) => faker.random.arrayElement(arr)));

const colors = ['red', 'green', 'blue'],
  initials = ['VL', 'SG', 'TM'],
  getTag = (i) => ({
    id: i.toString(),
    text: faker.random.arrayElement(initials),
    color: faker.random.arrayElement(colors),
    song: uniqueIds(1, 3)[0],
    date: new Date(),
    note: faker.lorem.sentence(),
  }),
  people = arrayOfSize(25).map((i) => {
    var costCenter = uniqueIds(1, 3)[0];
    return {
      id: (i + 1).toString(),
      first: faker.name.firstName(),
      last: faker.name.lastName(),
      info: faker.lorem.sentence(),
      gain: Number(faker.finance.amount(0, 1, 1)),
      gain1: Number(faker.finance.amount(0, 1, 1)),
      length: Number(faker.finance.amount(0, 100, 1)),
      film: uniqueIds(1, 6)[0],
      films: uniqueIds(3, 6),
      tag: getTag(1),
      active: faker.random.boolean(),
      release: new Date(),
      tags: arrayOfSize(3).map((j) => getTag(j + 1)),
      assigned: uniqueIds(2, 3),
      costCenter,
      account: `${costCenter}.${uniqueIds(1, 3)[0]}`,
      comment: faker.lorem.sentence(),
    };
  });

const model = {
  k1: 'qwe',
  k2: 12,
  k3: 'test title',
  k4: new Date(),
  k5: true,
  k7: '2',
  k77: '2',
  k8: {
    count: 21,
    page: 0,
    size: 1029,
    start: 0,
    nodes: people,
  },
  k9: ['1'],
  k15: '2',
  k16: '2.1',
  k25: '2',
  k26: '2.1',
  k27: undefined,
  k28: people,
  k29: {
    name: 'Chart of accounts',
    levels: [
      { id: '1', name: 'Cost centers' },
      { id: '2', name: 'Cost accounts' },
      { id: '3', name: 'Departments' },
    ],
    items: [
      { id: '1', name: 'Account #1' },
      { id: '2', name: 'Account #2' },
      { id: '3', name: 'This is a longer account name #3' },
    ],
  },
  k29a: [
    {
      id: '1',
      name: 'Cost Center #1',
      code: 'cs1',
      items: [
        { id: '1', name: 'Account #1', code: 'acc#11' },
        { id: '2', name: 'Account #2', code: 'acc#12' },
        { id: '3', name: 'This is a  account #3', code: 'acc#13' },
      ],
    },
    {
      id: '2',
      name: 'Cost Center #2',
      code: 'cs2',
      items: [
        { id: '1', name: 'Account #1', code: 'acc#21' },
        { id: '2', name: 'Account #2', code: 'acc#22' },
        { id: '3', name: 'This is a  account #3', code: 'acc#23' },
      ],
    },
    {
      id: '3',
      name: 'A longer CC name #3',
      code: 'cs3',
      items: [
        { id: '1', name: 'Account #1', code: 'acc#31' },
        { id: '2', name: 'Account #2', code: 'acc#32' },
        { id: '3', name: 'This is a  account #3', code: 'acc#33' },
      ],
    },
  ],
  k30: {
    forms: ['1.1', '1.2', '1.4', '1.5', '2.1.1', '2.1.2', '2.2.1'],
    jobs: [
      {
        id: daysStr[0],
        status: '4',
        forms: ['1.1', '1.2', '1.4'],
      },
      {
        id: daysStr[1],
        status: '3',
        forms: ['1.1', '1.5'],
      },
      {
        id: daysStr[2],
        status: '2',
        forms: ['1.1', '1.2', '1.4'],
      },
      {
        id: daysStr[3],
        status: '1',
        forms: ['1.2', '1.4'],
      },
      { id: daysStr[5], status: '0', forms: [] },
      { id: daysStr[6], status: '0', forms: [] },
      { id: daysStr[8], status: '0', forms: [] },
    ],
  },
  users: [
    { id: '1', name: 'Jeremy Clarkson', uom: 'M' },
    { id: '2', name: 'James May', uom: 'I' },
    { id: '3', name: 'Richard Hammond' },
  ],
};

const lookups = {
  Roles: [
    { name: 'Admin', id: 'admin' },
    { name: 'Power user', id: 'power' },
    { name: 'Field Manager', id: 'field' },
  ],
  JobStatus: [
    { name: 'Not started', id: '0' },
    { name: 'In work', id: '1' },
    { name: 'Submitted', id: '2' },
    { name: 'Rejected/In work', id: '3' },
    { name: 'Approved', id: '4' },
  ],
  Muds: [
    { name: 'Mud #1', id: '1' },
    { name: 'Mud #2', id: '2' },
    { name: 'Mud #3', id: '3' },
  ],
  Films: [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
  ].map((e, i) => ({
    ...e,
    rank: i,
    id: String(i + 1),
    key: i.toString(),
  })),
  Songs: [
    { title: 'Waterloo', year: 1973 },
    { title: 'Let it be', year: 1970 },
    { title: 'Candle in the wind', year: 1975 },
  ].map((e, i) => ({
    ...e,
    rank: i,
    id: String(i + 1),
    key: i.toString(),
  })),
  CostCenters: [
    {
      name: 'Cost center #1',
      id: '1',
      linkedTo: '1',
      accounts: [
        { name: 'Account #1.1', id: '1.1' },
        { name: 'Account #1.2', id: '1.2' },
        { name: 'Account #1.3', id: '1.3' },
      ],
    },
    {
      name: 'Cost center #2',
      id: '2',
      accounts: [
        { name: 'Account #2.1', id: '2.1' },
        { name: 'Account #2.2', id: '2.2' },
        { name: 'Account #2.3', id: '2.3' },
      ],
    },
    {
      name: 'Cost center #3',
      id: '3',
      linkedTo: '2',
      accounts: [
        { name: 'Account #3.1', id: '3.1' },
        { name: 'Account #3.2', id: '3.2' },
        { name: 'Account #3.3', id: '3.3' },
      ],
    },
  ],
};

const actions = [
    {
      text: 'New',
      icon: 'document',
      id: 'document',
      action: () => {
        //console.log('dropdown action!');
      },
    },
    { text: 'Open', icon: 'folder-shared', id: 'folder' },
    { text: 'Close', icon: 'add-to-folder', id: 'add' },
    {},
    { text: 'Save', icon: 'floppy-disk', id: 'disk' },
    { text: 'NeSave as...w', icon: 'floppy-disk', id: 'dis' },
    {},
    { text: 'Exit', icon: 'cross', id: 'exit' },
  ],
  user = model.users[1],
  refData = { gainSum: 70 };
init(user);

export { user, model, refData, schema, actions };
