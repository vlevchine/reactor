import simple from './simple';
import containers from './containers';
import complex from './complex';

const content = [
  [simple, 'Simple components'],
  [complex, 'Complex components'],
  [containers, 'Containers'],
];

const init = (root) => {
  content.forEach(([group, name]) => {
    group(root.addGroup(name));
  });
};

export default init;
