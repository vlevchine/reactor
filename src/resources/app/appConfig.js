var config = {
  title: 'Reactor',
  subtitle: 'Configurable App',
  id: 'app',
  navigation: 'side',
  sideToggle: 'sideToggle',
  sideWidth: '32ch',
  serverDB: {
    adapter: 'idb', // <- IndexedDB adapter; with memory use pouchdb-adapter-memory
    password: 'myPassword', // <- password (optional)
    multiInstance: true, // <- multiInstance (optional, default: true)
    queryChangeDetection: false, // <- queryChangeDetection (optional, default: false)
    entityMap: { wells: 'Well', well: 'Well', person: 'Person' },
    entityQueries: {
      entity: {
        name: 'getEntity',
        fields: 'id updatedAt json',
      },
      entities: {
        name: 'getEntities',
        fields: 'entities {id updatedAt json} count',
      },
    },
  },
  clientDB: {
    name: 'appdb', // <- name
    adapter: 'idb', // <- IndexedDB adapter; with memory use pouchdb-adapter-memory
    versions: [
      {
        lookups: 'id,values',
        pages: 'id,name',
      },
    ],
  },
  roles: [
    {
      id: 'geologist',
      name: 'Geology specialist',
    },
    {
      id: 'geophysist',
      name: 'Geophysics specialist',
    },
    {
      id: 'landEngineer',
      name: 'Land services specialist',
    },
    {
      id: 'landManager',
      name: 'Land services Manager',
    },
    {
      id: 'geoManager',
      name: 'Geo Manager',
    },
    {
      id: 'officeManager',
      name: 'Office Manager',
    },
    {
      id: 'fieldManager',
      name: 'Field Manager',
    },
    {
      id: 'admin',
      name: 'Admin',
    },
    {
      id: 'dev',
      name: 'Developer',
    },
    {
      id: 'power',
      name: 'Power user',
    },
  ],
  workflowConfig: {
    projectTypes: [
      {
        id: 'workflow',
        name: 'Workflow-based',
      },
      {
        id: 'calendar',
        name: 'Calendar-based',
      },
    ],
    projectGroups: [
      {
        id: 'reno',
        name: 'Home renovations',
      },
      {
        id: 'oag_up',
        name: 'Oil & Gas / Upstream',
      },
    ],
    taskGroupTypes: [
      {
        id: 'seq',
        name: 'Run tasks in sequence',
      },
      {
        id: 'parallel',
        name: 'Run tasks in parallel',
      },
    ],
    taskTypes: [
      {
        id: 'simple',
        name: 'Simple task',
      },
      {
        id: 'form',
        name: 'Requires form',
      },
      {
        id: 'approval',
        name: 'Requires approval',
      },
    ],
  },

  staticPages: {
    home: {
      title: 'Reactor',
      path: '',
      icon: 'atom-alt',
    },
    impersonate: {
      title: 'Impersonate',
      path: 'impersonate',
      icon: 'user-friends',
    },
    app: {
      title: 'Main app',
      path: 'app',
      icon: 'browser',
    },
    logout: { name: 'Log out', icon: 'sign-out' },
  },
  headerOptions: [
    {
      id: 'uom',
      label: 'Units of measure',
      icon: 'ruler-triangle',
    },
    {
      id: 'locale',
      label: 'Language',
      icon: 'globe-americas',
    },
  ],
  pages: {
    headerLinks: [
      {
        id: 'messageboard',
        label: 'Message Board',
        icon: 'envelope-open-text',
      },
      {
        id: 'preferences',
        label: 'Preferences',
        icon: 'user',
      },
      {
        id: 'about',
        label: 'About',
        icon: 'info',
      },
    ],
    menu: [
      {
        id: 'wellList',
        title: 'Well List',
        icon: 'tint',
        //queryTypes: 'Tag',
        dataQuery: {
          name: 'wells',
          type: 'entities',
          params: { options: { size: 30 } },
          fields:
            'licensee licenseDate name uwi depth spudDate purpose field rig type crownOwned',
        },
      },
      {
        id: 'group1',
        title: 'First group',
        icon: 'envelope-open-text',
        items: [
          {
            id: 'first1',
            title: 'First level - page #1',
            queryTypes: 'Tag',
            dataQuery: {
              name: 'companies',
              type: 'entities',
              fields: 'id name',
            },
            tabs: [
              {
                id: 'first11',
                default: true,
                name: 'Tab #1',
                title: 'Second level - page #1',
                icon: 'address-card',
                dataQuery: [
                  {
                    name: 'person',
                    type: 'entity',
                  },
                ],
              },
              {
                id: 'first12',
                title: 'Second level - page #2',
                name: 'Tab #2',
                icon: 'adjust',
                guard: { offRole: ['admin'] },
                schema: 'first12',
              },
              {
                id: 'first13',
                title: 'Second level - page #3',
                name: 'Tab #3',
                icon: 'boot',
              },
            ],
          },
          {
            id: 'first2',
            title: 'First level - page #2',
            queryTypes: 'Tag',
          },
          {
            id: 'first_2',
            title: 'First level - page #__2',
          },
          {
            id: 'first3',
            title: 'First level - page #3',
            dataQuery: [
              {
                name: 'person',
                type: 'entity',
              },
            ],
          },
        ],
      },
      {
        id: 'group3',
        title: 'Second group',
        icon: 'cogs',
        items: [
          {
            id: 'sec1',
            title: 'Second page #1',
            dataQuery: [
              {
                name: 'getPerson',
                alias: 'person',
                fields: 'id createdAt json',
                valueType: 'Person',
              },
            ],
          },
          {
            id: 'sec2',
            title: 'Second page #2',
          },
          {
            id: 'sec3',
            title: 'Second page #3',
            guard: { inRole: ['geoManager'] },
          },
        ],
      },
      {
        id: 'admin',
        title: 'Admin',
        icon: 'cogs',
        markup: true,
        guard: { inRole: ['admin'] },
        tabs: [
          {
            id: 'prefs',
            title: 'Preferences',
            dataQuery: {
              name: 'companies',
              fields: 'id name',
            },
          },
          { id: 'users', title: 'Users', queryTypes: 'Tag' },
        ],
      },
      {
        id: 'dev',
        title: 'Development',
        icon: 'envelope-open-text',
        items: [
          {
            id: 'procDefs',
            title: 'Process templates',
          },
          {
            id: 'taskDefs',
            params: ['id'],
            title: 'Task templates',
          },
          {
            id: 'formDef',
            title: 'TaSK Form',
            offMenu: true,
          },
          {
            id: 'types',
            title: 'Type defs',
          },
          {
            id: 'lookups',
            title: 'Lookup defs',
          },
          {
            id: 'play',
            title: 'Playground',
          },
        ],
      },
    ],
    offMenu: [
      {
        id: 'well',
        title: 'Well',
        dataQuery: {
          name: 'wells',
          type: 'entity',
          params: { route: ['id'] },
        },
      },
      {
        id: 'taskTemplate',
        title: 'Task templates',
      },
    ],
  },
};

module.exports = config;
