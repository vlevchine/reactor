import Browser from './client/browser';
import Model from './client/model';
import Forms from './client/forms';
import Components from './client/components';
import { componentsRoot, formsRoot } from './client/storyConfig';

const uri = 'http://localhost:4000/graphql',
  items = [
    {
      id: '_components',
      label: 'Components',
      component: Components,
      topic: 'COMPONENTSTORIES',
    },
    {
      id: '_forms',
      label: 'Forms',
      component: Forms,
      topic: 'FORMSSTORIES',
    },
    {
      id: '_model',
      label: 'App Model',
      component: Model,
      topic: 'MODELCONFIG',
    },
  ];

export { uri, items };
