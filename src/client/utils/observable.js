import { _ } from '@app/helpers';
// setterName = (name) =>
//   `set${name[0].toUpperCase()}${name.slice(1)}`,
const dataStatuses = ['idle', 'running', 'error', 'success'];
export const createDataStatus = () => new Status(dataStatuses);
export class Status {
  constructor(names, value = 0) {
    this.statusNames = names;
    this.maxValue = names.length - 1;
    this._value = value;
  }
  minValue: 0;
  get value() {
    return this._value;
  }
  get name() {
    return this.statusNames[this._value];
  }
  set value(v) {
    this._value = v;
  }
  set name(n) {
    this._value = this.getValue(n);
  }
  getValue(name) {
    return this.statusNames.indexOf(name);
  }
  isZero() {
    return this._value < 1;
  }
  isHigher(st) {
    return (
      this._value > (_.isString(st) ? this.getValue(st) : st.value)
    );
  }
}

export class Observable {
  constructor(name) {
    this.subscribers = new Map();
    this.active = new WeakSet();
    this.name = name;
  }
  subscribe(o, error = _.noop, pause) {
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

export class DataObservable extends Observable {
  constructor(data = {}, name) {
    super(name);
    this.status = createDataStatus();
    this.data = data;
    this.error = '';
  }
  setRunning() {
    this.status.set('running');
  }
  isReady() {
    return this.status.isHigher('idle');
  }
  statusValue() {
    return this.status.value;
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
    this.status.name('success');
    this.error = '';
    super.onSuccess(this.data);
  }
  onError(e) {
    this.error = e;
    this.status.name('error');
    const msg = { status: this.status, error: e };
    super.onError(msg);
    return msg;
  }
}

const filterTypes = {
  debounce: 'debounce',
  throttle: 'throttle',
};
export class EventObservable extends Observable {
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
