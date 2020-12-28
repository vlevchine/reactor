import { Observable } from '@app/utils/observable';
import { AUTH, ERR, NAV } from '@app/constants';
import { _ } from '@app/helpers';
import {
  actions,
  topicList,
  MemoryTopic,
  CachedTopic,
} from './topics';

//State manager - topic-based message broker
//data are stored in memory (content) and in storage via cache object
let cache,
  topics = Object.create(null);

const init = (ch) => {
  cache = ch;
  topicList.memory.forEach((t) => (topics[t] = new MemoryTopic(t)));
  topicList.cached.forEach(
    (t) => (topics[t] = new CachedTopic(t, cache))
  );
  topicList.session.forEach(
    (t) => (topics[t] = new CachedTopic(t, cache, true))
  );
  return topics;
};
const getTopic = (topic) => {
    if (!topics[topic]) {
      console.log(topic);
    }
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
    return getTopic(top).subscribe(key);
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
  dispatchAuth = (payload) => _dispatch(AUTH, payload),
  dispatchErr = (value) => _dispatch(ERR, { value }),
  dispatchNav = (payload) => _dispatch(NAV, payload),
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
  command = new Observable('command'),
  store = {
    init,
    clear,
    actions,
    getState,
    getStates,
    subscribe,
    unsubscribe,
    dispatch,
    dispatchAuth,
    dispatchNav,
    dispatchErr,
    getDispatcher,
    command,
    sendCommand: (args) => command.onSuccess(args),
  };

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