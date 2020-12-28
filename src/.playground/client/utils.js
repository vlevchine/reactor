import faker from 'faker';

const fakes = {
    text: faker.random.word,
    number: faker.random.number,
    bool: faker.random.boolean,
  },
  fakeObject = (props, key) =>
    props.reduce(
      (acc, p, i) => ({
        ...acc,
        [p.name]: p.auto ? `${key + 1}` : (fakes[p.type] || fakes.text)(),
      }),
      { key }
    ),
  fake = {
    object: fakeObject,
    arrayOf: (props, size = 0) =>
      Array(size)
        .fill(size)
        .map((_, i) => fakeObject(props, i)),
  };

// const addItem = (self, name, type) => {
//   let item = self.groups.find((e) => e.name === name);
//   if (!item) {
//     const constr = type === 'story' ? Story : StoryGroup;
//     item = new constr(
//       name,
//       self.key ? `${self.key}.${self.groups.length}` : `${self.groups.length}`
//     );
//     self.groups.push(item);
//   }
//   return item;
// };

// class StoryGroup {
//   constructor(name, key) {
//     Object.assign(this, {
//       name,
//       key,
//       id: key.replace(/\./g, '_'),
//       groups: [],
//       icon: 'applications',
//     });
//   }
//   addGroup(name) {
//     return addItem(this, name, 'group');
//   }
//   addStory(name, model) {
//     const story = addItem(this, name, 'story');
//     story.model = model;
//     return story;
//   }
// }

// class Story {
//   constructor(name, key) {
//     Object.assign(this, {
//       name,
//       key,
//       id: key.replace(/\./g, '_'),
//       scenarios: [],
//       icon: 'application',
//     });
//   }
//   add(name, Comp, props) {
//     const key = `id_${this.scenarios.length}`,
//       prps = isFunction(Comp) ? {} : props,
//       scenario = {
//         name,
//         Comp,
//         props: { ...prps, id: key },
//         key,
//       };

//     this.scenarios.push(scenario);
//     return this;
//   }
// }

// const storyRoot = new StoryGroup('root', ''),
//   storyOf = (name) => storyRoot.addGroup(name),
//   stories = storyRoot.groups;   , storyRoot, storyOf

export { fake };
