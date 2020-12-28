import { componentsRoot, formsRoot } from './storyConfig';
import { schema as extraSchema, user } from './_forms/sampleData';
const items = [
    {
      key: '_tools',
      icon: 'document',
      label: 'App Configuration',
      path: '_tools',
      component: 'Tool',
    },
  ],
  tabs = [
    {
      component: 'Browser',
      key: '_components',
      topic: 'COMPONENTSTORIES',
      label: 'Components',
      path: '_components',
      root: componentsRoot,
    },
    {
      component: 'Browser',
      key: '_forms',
      topic: 'FORMSSTORIES',
      label: 'Forms',
      path: '_forms',
      root: formsRoot,
    },
    {
      component: 'Config',
      key: '_config',
      topic: 'APPCONFIG',
      label: 'App Configuration',
      path: '_config',
    },
    {
      component: 'Model',
      key: '_model',
      topic: 'MODELCONFIG',
      label: 'App Model',
      path: '_model',
    },
  ];

export { items, extraSchema, user, tabs };
