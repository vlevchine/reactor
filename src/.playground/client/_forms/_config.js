import testing from '@app/forms/test1/testing';
import tabs from '@app/forms/test1/tabs';
import table from '@app/forms/test1/table';
import selects from '@app/forms/test2/selects';
import list from '@app/forms/test2/list';

const content = [
  {
    name: 'Test Forms #1',
    id: '1',
    groups: [
      {
        name: 'Test11',
        id: '1',
        stories: [
          {
            name: 'Testing',
            id: '1',
            queryTypes: ['Test', 'Tag'],
            query: `test {    name  }`,
            form: { path: 'test1/testing' },
          },
          {
            name: 'Tabs',
            id: '2',
            queryTypes: ['Test'],
            form: { path: 'test1/tabs' },
          },
        ],
      },
      {
        name: 'Test12',
        id: '1',
        stories: [
          {
            name: 'Table',
            id: '1',
            queryTypes: ['Person'],
            form: { path: 'test1/table' },
          },
          {
            name: 'Hierarchies',
            id: '2',
            queryTypes: ['Test'],
            form: { path: 'test1/misc' },
          },
          {
            name: 'Simple/Ref tables',
            id: '3',
            queryTypes: ['Test'],
            form: { path: 'test1/misc1' },
          },
        ],
      },
    ],
  },
  {
    name: 'Test Forms #2',
    id: '2',
    groups: [
      {
        name: 'Test2',
        id: '1',
        stories: [
          {
            name: 'Selects',
            id: '1',
            queryTypes: ['Test', 'Tag'],
            form: { path: 'test2/selects' },
          },
          {
            name: 'List',
            id: '2',
            type: 'activity',
            pageData: { wellId: 'well#1', activityId: 'drilling#1' },
            queryTypes: ['FormContext'],
            form: { path: 'test2/list' },
          },
        ],
      },
    ],
  },
  {
    name: 'containers',
    id: '3',
    groups: [{ name: 'sub', stories: [] }],
  },
];

export default content;
