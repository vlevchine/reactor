import produce from 'immer';
import { nanoid } from 'nanoid';
import { _ } from '@app/helpers';
import {
  AUTH,
  NAV,
  SESSION,
  // ERR,
  // PAGES,
  DIALOG,
  // MODELCONFIG,
  // APPCONFIG,
  // MODEL,
  UPDATE,
  ADD,
  MOVE,
  SET,
} from '@app/constants';

const { set, get, isFunction } = _;
//!!! to clear topic - dispatch empty object/undefined
class StatelessTopic {
  constructor(name) {
    this.name = name;
    this.subscribers = new Map();
  }
  subscribe(fn) {
    const id = nanoid(4);
    if (!isFunction(fn))
      throw new Error('Callback is required for subscription');
    this.subscribers.set(id, fn);
    return id;
  }
  unsubscribe(id) {
    this.subscribers.delete(id);
    return id;
  }
  cache(val) {
    this.value = val;
  }
  notify(val) {
    this.subscribers.forEach((fn) => fn(val));
  }
}
class Topic extends StatelessTopic {
  constructor(name) {
    super(name);
  }
  read(path) {
    const ctn = this.readRaw();
    return get(ctn || Object.create(null), path);
  }
  setContent(val, path) {
    return path ? set(this.read(), path, val) : val;
  }
  reduce({ value, path }) {
    const state = this.readRaw(),
      newState =
        value || path
          ? produce(state || Object.create(null), (draft) => {
              set(draft, path, value);
            })
          : undefined;
    if (state !== newState) {
      this.write(newState);
      this.notify(newState);
    }
  }
}
//Cached topic
class MemoryTopic extends Topic {
  constructor(name) {
    super(name);
    this.data = Object.create(null);
  }
  readRaw() {
    return this.data;
  }
  write(val, path) {
    this.data = this.setContent(val, path);
  }
}

class CachedTopic extends Topic {
  constructor(name, cache, session) {
    super(name);
    this.cache = cache;
    this.session = session;
  }
  readRaw() {
    return this.cache.get(this.session, this.name);
  }
  write(val, path) {
    const ctn = this.setContent(val, path);
    this.cache.set(this.session, this.name, ctn);
  }
}
//topics serves for
const actions = {
  UPDATE,
  ADD,
  MOVE,
  SET,
};
const topicList = {
  memory: [AUTH, SESSION],
  cached: [NAV],
  session: [],
  command: [DIALOG],
};

export {
  actions,
  topicList,
  MemoryTopic,
  CachedTopic,
  StatelessTopic,
};
