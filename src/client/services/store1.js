//import { AUTH, ERR, NAV } from '@app/constants';
import { _ } from '@app/helpers';
import {
  topicList,
  MemoryTopic,
  CachedTopic,
  StatelessTopic,
} from './topics';

//State manager - topic-based message broker
//data are stored in memory (content) and in storage via cache object
let cache,
  topics = Object.create(null),
  commands = Object.create(null);

export function initStore(ch) {
  cache = ch;
  topicList.command.forEach(
    (t) => (commands[t] = new StatelessTopic(t))
  );
  topicList.memory.forEach((t) => (topics[t] = new MemoryTopic(t)));
  topicList.cached.forEach(
    (t) => (topics[t] = new CachedTopic(t, cache))
  );
  topicList.session.forEach(
    (t) => (topics[t] = new CachedTopic(t, cache, true))
  );
  return topics;
}
export function clearStore() {
  cache.clear();
}

const getCommand = (cmd) => {
    const command = commands[cmd];
    if (!command) throw new Error(`Command ${cmd} does not exist!`);
    return command;
  },
  on = (cmd, func, hot) => {
    const _cmd = getCommand(cmd),
      val = _cmd.value;
    if (hot && val)
      setTimeout(
        (fn, v) => {
          fn(v);
        },
        10,
        func,
        val
      );
    return _cmd.subscribe(func);
  },
  off = (cmd, id) => {
    return getCommand(cmd).unsubscribe(id);
  },
  command = (cmd, data) => {
    const _cmd = getCommand(cmd);
    _cmd.cache(data);
    return _cmd.notify(data);
  },
  getTopic = (topic) => {
    if (!topics[topic]) {
      console.log(topic);
    }
    if (!topics[topic]) throw `Topic does not exist: ${topic}`;
    return topics[topic];
  },
  subscribe = (top, observe, hot) => {
    const topic = getTopic(top),
      id = topic.subscribe(observe);
    if (hot) observe(topic.read());
    return id;
  },
  unsubscribe = (top, key) => {
    return getTopic(top).unsubscribe(key);
  },
  getState = (top, ...path) => {
    const topic = getTopic(top);
    return topic.read(path);
  },
  _dispatch = (type, payload = {}) => {
    const topic = getTopic(type);
    topic.reduce(payload);
  },
  dispatch = (type, payload) => {
    return _.isString(type)
      ? _dispatch(type, payload)
      : Object.entries(type).forEach(([k, v]) => _dispatch(k, v));
  };
// dispatchAuth = (payload) => _dispatch(AUTH, payload),
// dispatchErr = (value) => _dispatch(ERR, { value }),
// dispatchNav = (payload) => _dispatch(NAV, payload),
// getDispatcher = (op, key, topic = topics.PAGES) => ({
//   id,
//   ...rest
// }) => {
//   dispatch(topic, {
//     ...rest,
//     id: `${key}.${id}`,
//     op,
//   });
// };

export function useStore() {
  return {
    getState,
    subscribe,
    unsubscribe,
    dispatch,
    on,
    off,
    command,
  };
}
