import { _ } from '@app/helpers';

const noop = () => {};
const statusNames = ['idle', 'running', 'error', 'success'],
  status = statusNames.reduce((acc, e) => ({ ...acc, [e]: e }), {}),
  statusValues = statusNames.reduce(
    (acc, e, i) => ({ ...acc, [e]: i }),
    {}
  );

class Observable {
  constructor(name) {
    this.subscribers = new Map();
    this.active = new WeakSet();
    this.name = name;
  }
  subscribe(o, error = noop, pause) {
    if (_.isFunction(o)) o = { next: o, error };
    if (!o.next) throw new Error('Incorrectly formatted oberver');
    const vals = [...this.subscribers.entries()],
      item = vals.find((e) => e[1] === o);
    let key = item ? item[0] : Symbol();
    this.subscribers.set(key, o);
    !pause && this.active.add(o);
    return key;
  }
  unsubscribe(key) {
    this.subscribers.delete(key);
  }
  pause(key) {
    const sub = this.subscribers.get(key);
    if (sub) this.active.delete(sub);
  }
  continue(key) {
    const sub = this.subscribers.get(key);
    if (sub) this.active.add(sub);
  }
  clear() {
    this.subscribers.clear();
  }
  onSuccess(d) {
    this.subscribers.forEach((v) => this.active.has(v) && v.next(d));
  }
  onError(e) {
    this.subscribers.forEach((v) => this.active.has(v) && v.error(e));
  }
}

class DataObservable extends Observable {
  constructor(data = {}, name) {
    super(name);
    this.status = DataObservable.status.idle;
    this.data = data;
    this.error = '';
  }
  setRunning() {
    this.status = DataObservable.status.running;
  }
  isReady() {
    return this.status !== DataObservable.status.idle;
  }
  statusValue() {
    return DataObservable.statusValues[this.status];
  }
  current() {
    return {
      status: this.status,
      data: this.data,
      error: this.error,
    };
  }
  processResult(d) {
    return d;
  }
  assignResult(d) {
    Object.assign(this.data, this.processResult(d));
  }
  onSuccess(d) {
    this.assignResult(d);
    this.status = DataObservable.status.success;
    this.error = '';
    super.onSuccess(this.data);
  }
  onError(e) {
    this.error = e;
    this.status = DataObservable.status.error;
    const msg = { status: this.status, error: e };
    super.onError(msg);
    return msg;
  }
  static status = status;
  static statusValues = statusValues;
  static maxStatusValue = statusNames.length - 1;
  static minStatusValue = 0;
  static getStatusName(v) {
    return statusNames[v];
  }
}
const filterTypes = {
  debounce: 'debounce',
  throttle: 'throttle',
};
class EventObservable extends Observable {
  constructor(name, options) {
    super(name);
    this.process = options.process || _.identity;
    this.operation = filterTypes[options?.type] || this.bypass;
    this.onEvent = this.operation.bind(this);
    this.wait = options?.wait || 0;
  }
  bypass(ev) {
    this.onSuccess(this.process(ev));
  }
  throttle(ev) {
    this.value = this.process(ev);
    if (!this.timer) {
      this.timer = setTimeout(
        () => {
          this.timer = undefined;
          this.onSuccess(this.value);
        },
        this.wait,
        this
      );
    }
  }
  debounce(ev) {
    this.value = this.process(ev);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.timer = setTimeout(
      () => {
        this.timer = undefined;
        this.onSuccess(this.value);
      },
      this.wait,
      this
    );
  }
}

export { Observable, DataObservable, EventObservable };
