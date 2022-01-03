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
      name: 'Mineral Land specialist',
    },
    {
      id: 'landManager',
      name: 'Mineral Lands Manager',
    },
    {
      id: 'geoManager',
      name: 'Geo Manager',
    },
    {
      id: 'fieldManager',
      name: 'Field Manager',
    },
    {
      id: 'electrician',
      name: 'Electrician',
    },
    {
      id: 'plumber',
      name: 'Plumber',
    },
    {
      id: 'drywaller',
      name: 'Drywall installer',
    },
    {
      id: 'carpenter',
      name: 'Carpenter',
    },
    {
      id: 'paint',
      name: 'Painter',
    },
    {
      id: 'tile',
      name: 'Tile installer',
    },
    {
      id: 'hardwood',
      name: 'Harwood installer',
    },
    {
      id: 'officeManager',
      name: 'Office Manager',
    },
    {
      id: 'guest',
      name: 'Guest',
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
    assetTypes: [
      {
        id: 'well',
        name: 'Well (Oil & Gas)',
      },
      {
        id: 'house',
        name: 'Home renovations',
      },
      {
        id: 'building',
        name: 'House construction',
      },
    ],
    projectTypes: [
      {
        id: 'workflow',
        name: 'Workflow-based',
      },
      {
        id: 'calendar',
        name: 'Daily Reporting',
      },
      {
        id: 'approval',
        name: 'Document Approval',
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
  root: 'app',
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
  },
  logout: { name: 'Log out', icon: 'sign-out' },
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
  pages: {
    menu: [
      {
        id: 'assets',
        title: 'Assets & resources',
        icon: 'address-card',
        items: [
          {
            id: 'wellList',
            default: true,
            title: 'Well List',
            itemRoute: 'well',
            dataQuery: {
              name: 'wells',
              type: 'entities',
              params: { options: { size: 30 } },
              fields:
                'licensee licenseDate name uwi depth spudDate purpose field rig type crownOwned',
            },
          },
          {
            id: 'rigs',
            title: 'Rig scheduler',
          },
          {
            id: 'personnel',
            title: 'Personnel',
          },
        ],
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
            tabs: true,
            items: [
              {
                id: 'first11',
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
            items: [
              {
                id: 'first11',
                name: 'Tab #1',
                title: 'Second level - page #1',
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
                guard: { offRole: ['admin'] },
                schema: 'first12',
              },
              {
                id: 'first13',
                title: 'Second level - page #3',
                name: 'Tab #3',
              },
            ],
          },
          {
            id: 'sec3',
            title: 'Second page #3',
            guard: { inRole: ['geoManager'] },
          },
        ],
      },
      {
        id: 'activities',
        title: 'Activities',
        icon: 'tasks',
        items: [
          { id: 'afe', title: 'AFE' },
          { id: 'rtd', title: 'RTD' },
          {
            id: 'construction',
            title: 'Pad Construction',
          },
          { id: 'drilling', title: 'Drilling' },
          { id: 'completion', title: 'Completion' },
          { id: 'suspension', title: 'Suspension' },
        ],
      },
      {
        id: 'admin',
        title: 'Admin',
        icon: 'cogs',
        markup: true,
        guard: {
          r: { inRole: ['admin', 'guest'] },
          w: { inRole: ['admin'] },
        },
        items: [
          { id: 'users', title: 'Users' },
          {
            id: 'companies',
            title: 'Companies',
          },
          { id: 'userGroups', title: 'User groups' },
          { id: 'costCenters', title: 'Cost Centers' },
        ],
      },
      {
        id: 'dev',
        title: 'Development',
        icon: 'file-code',
        guard: {
          r: { inRole: ['dev', 'admin'] },
          w: { inRole: ['dev'] },
        },
        items: [
          {
            id: 'ogc',
            title: 'Oil & Gas',
            icon: 'tint',
            items: [
              {
                id: 'afe',
                title: 'AFE',
                guard: { inRole: ['dev'] },
              },
              { id: 'rtd', title: 'RTD' },
              {
                id: 'construction',
                title: 'Pad construction',
                tabs: true,
                items: [
                  { id: 'workflows', title: 'Workflows' },
                  { id: 'roles', title: 'Roles' },
                  { id: 'lookups', title: 'Lookups' },
                  { id: 'types', title: 'Types' },
                ],
              },
              { id: 'drilling', title: 'Drilling' },
              { id: 'completion', title: 'Completion' },
              { id: 'suspension', title: 'Suspension' },
            ],
          },
          {
            id: 'homes',
            title: 'Homes',
            icon: 'home',
            items: [
              {
                id: 'construction',
                title: 'Construction',
              },
              { id: 'reno', title: 'Renovations' },
            ],
          },
          {
            id: 'procDefs',
            title: 'Process defs',
          },
          {
            id: 'formEditor',
            title: 'Form Editor',
            params: ['id'],
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
        },
        params: ['id'],
      },
      {
        id: 'taskTemplate',
        title: 'Task templates',
        params: ['id'],
      },
    ],
  },
};

module.exports = config;
