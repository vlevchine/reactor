import Big from 'big.js';
import { _ } from '@app/helpers';
import units from '@app/appData/units.json';
import uom from '@app/appData/uom.json';

const { compose } = _,
  //convert Big to number -
  // toNumber = (v) => Number(v.toString()),
  getLabel = (u) => units[u]?.lbl;

const unitNumber = {
  //()->Number
  valueOf() {
    return this.value.toNumber();
  },
  toString() {
    return this.value?.toString() || '';
  },
  //(Number)-> string
  toPrecision(s) {
    return this.value?.toPrecision(s) || '';
  },
  //(Number)-> string
  toFixed(s) {
    return this.value?.toFixed(s) || '';
  },
  getLabel(system = 'M') {
    return getLabel(this[system] || this.M);
  },
  //(string,{})->stirng
  //from base: y = (c * x + a) / b
  //u.transorm(null, {dp: 3}) - same as u.toFixed(3)
  convert(u) {
    const { base, a = 0, b = 1, c = 1 } = units[u] || {};
    if (!base) return this.valueOf();
    const val = this.value.times(c).plus(a).div(b);
    return val.toNumber();
  },
  set(v, u) {
    const { base, a = 0, b = 1, c = 1 } = units[u] || {},
      val = new Big(v);
    this.value = base ? val.times(b).minus(a).dividedBy(c) : val;
  },
  //converts to default unit of the system, no param works for metric
  toUnitSystem(system) {
    return this.convert(this[system] || this.M);
  },
  fromUnitSystem(v, system) {
    this.set(v, this[system] || this.M);
    return this;
  },
};
const getReady = compose(Object.seal, Object.freeze, Object.assign),
  createType = (spec) => getReady(Object.create(unitNumber), spec),
  boxed = createType({
    getLabel() {
      return '';
    },
    toUnitSystem() {
      return this.value;
    },
    fromUnitSystem(v) {
      this.value = v;
      return this;
    },
  }),
  types = Object.entries(uom).reduce((acc, [k, v]) => {
    acc[k] = createType(v);
    return acc;
  }, Object.create(null));

export const createTypedValue = (type, v) => {
  const spec = types[type],
    val = Object.create(spec || boxed);
  val.set(v);
  return val;
};
