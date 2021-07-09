import { isFunction } from '@app/helpers';

const addItem = (self, name, type) => {
  let item = self.groups.find((e) => e.name === name);
  if (!item) {
    const constr = type === 'story' ? Story : StoryGroup;
    item = new constr(
      name,
      self.key
        ? `${self.key}.${self.groups.length}`
        : `${self.groups.length}`,
      type
    );
    item.parent = self;
    self.groups.push(item);
  }
  return item;
};
const createKey = (items = []) => {
  const itms = items.map((e) => Number(e.id)),
    num = itms.length === 0 ? 1 : Math.max(...itms) + 1;
  if (Number.isNaN(num) || num.toString() === `-Infinity`) {
    var rt = num;
  }
  return num.toString();
};

class Story {
  constructor(name, id) {
    Object.assign(this, {
      name,
      id, //: key.replace(/\./g, '_'),
      scenarios: [],
      icon: 'application',
      type: 'story',
    });
  }
  add(name, Comp, props) {
    const id = createKey(this.scenarios),
      prps = isFunction(Comp) ? {} : props;
    this.scenarios.push({
      name,
      Comp,
      props: { ...prps, id },
      id,
    });

    return this;
  }

  runForm(context) {
    //!!! Story may override context provided, using faked data from this.context
    return this.form({
      ...context,
      ...this.context,
      parentId: this.id,
    });
  }

  cleanup() {
    this.scenarios.length = 0;
  }
}

class StoryGroup {
  constructor(name, id, type = 'group') {
    Object.assign(this, {
      name,
      id, //: key.replace(/\./g, '_'),
      groups: [],
      icon: 'applications',
    });
  }
  addGroup(name, context) {
    let item = this.groups.find((e) => e.name === name);
    if (!item) {
      item = new StoryGroup(name, createKey(this.groups));
      this.groups.push(item);
    }
    item.context = context;
    return item;
  }
  addStory(name, context, options = {}) {
    let story = this.groups.find((e) => e.name === name);
    if (!story) {
      story = new Story(name, createKey(this.groups));
      this.groups.push(story);
    }
    story.context = context;
    story.options = options;
    return story;
  }
  addFormStory(name, id, settings = {}) {
    const story = this.addStory(name, this.context);
    Object.assign(story, { id }, settings);
    return story;
  }
  cleanup() {
    this.groups.forEach((e) => e.cleanup());
    this.groups.length = 0;
  }
  first(dflt) {
    return this.groups[0] || dflt;
  }
}

export default StoryGroup;
