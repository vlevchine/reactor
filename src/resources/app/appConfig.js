var config = {
  title: 'Reactor',
  subtitle: 'Configurable App',
  id: 'app',
  navigation: 'side',
  sideToggle: 'sideToggle',
  sideWidth: '32ch',
  locale: [
    { value: 'en-CA', label: 'English-CA' },
    { value: 'en-US', label: 'English-USA' },
    { value: 'de-DE', label: 'German' },
  ],
  uom: [
    { value: 'M', label: 'Metric' },
    { value: 'I', label: 'Imperial' },
  ],
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
      id: 'admin',
      name: 'Admin',
    },
  ],
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
          params: { options: { size: 40 } },
          fields:
            'licensee licenseDate name uwi depth spudDate purpose field rig type crownOwned',
        },
      },
      {
        id: 'group1',
        title: 'First group',
        icon: 'adjust',
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
          },
        ],
      },
      {
        id: 'group3',
        title: 'Second group',
        icon: 'anchor',
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
        icon: 'tools',
        markup: true,
        guard: { inRole: ['admin'] },
        tabs: [
          {
            id: 'lookups',
            title: 'Lookups',
            dataQuery: {
              name: 'companies',
              fields: 'id name',
            },
          },
          { id: 'users', title: 'Users', queryTypes: 'Tag' },
        ],
      },
    ],
    offMenu: [
      {
        id: 'well',
        title: 'Well',
        params: ['id'],
        dataQuery: {
          name: 'well',
          type: 'entity',
        },
      },
    ],
  },
};

module.exports = config;
