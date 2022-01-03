import { ERR } from '@app/constants';
import { _ } from '@app/helpers';
import {
  actions,
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

const init = (ch) => {
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
};
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
    if (!topics[topic]) throw `Topic does not exist: ${topic}`;
    return topics[topic];
  },
  clear = () => {
    cache.clear();
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
  getStates = () => {
    // const v1 = tops.map((t) => getTopic(t).read()),
    //   v2 = tops.map((t) => getTopic(t).readTopic());
    return;
  },
  _dispatch = (type, payload = {}) => {
    const topic = getTopic(type);
    topic.reduce(payload);
  },
  dispatch = (type, payload) => {
    return _.isString(type)
      ? _dispatch(type, payload)
      : Object.entries(type).forEach(([k, v]) => _dispatch(k, v));
  },
  dispatchErr = (value) => _dispatch(ERR, { value }),
  getDispatcher = (op, key, topic = topics.PAGES) => ({
    id,
    ...rest
  }) => {
    dispatch(topic, {
      ...rest,
      id: `${key}.${id}`,
      op,
    });
  },
  store = {
    init,
    clear,
    actions,
    getState,
    getStates,
    subscribe,
    unsubscribe,
    dispatch,
    dispatchErr,
    getDispatcher,
    on,
    off,
    command,
  };

export const getTopicService = (name) => ({
  subscribe: (cb, hot) => store.subscribe(name, cb, hot),
  unsubscribe: (sub) => store.unsubscribe(name, sub),
  get: (path) => topics[name].read(path),
  dispatch: (payload) => _dispatch(name, payload),
  clear: (path) =>
    _dispatch(name, {
      value: path ? { [path]: undefined } : undefined,
    }),
});

export default store;
// var   thread = spawn(function(input, done) {
//     var reducers = {
//       add: (state, payload) => {
//         return payload;
//       },
//       // [topics.REMOVE]: (payload) => {
//       //   return payload;
//       // },
//     };
//     const { type, state, payload } = input;
//     const output = reducers[type](state, payload);
//     done(output);
//   });
//   thread.send(msg)
