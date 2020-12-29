import Decimal from 'decimal.js-light';
import { _ } from '@app/helpers';
import units from '@app/appData/units.json';
import uom from '@app/appData/uom.json';

const { isString } = _;
//Must be initialize at the root with user settings
let prefferedUnits = 'M',
  setUOM = (user = {}) => {
    if (user.uom) prefferedUnits = user.uom;
  },
  init = (user = {}) => {
    setUOM(user);
  };

const translate = {
    datum: (v, ref = 0) => new Decimal(ref).minus(v).toNumber(),
  },
  getTranslator = (ref) => ref && translate[ref.type];
const transformValue = (v, unit = {}) => {
    //from base: y = (c * x + a) / b
    const { base, a = 0, b = 1, c = 1 } = unit,
      value = base
        ? new Decimal(v).times(c).plus(a).dividedBy(b).toNumber()
        : v;
    return value;
  },
  transformBack = (v, unit = {}) => {
    const { base, a = 0, b = 1, c = 1 } = unit;
    if (!base) return v;
    return base
      ? new Decimal(v).times(b).minus(a).dividedBy(c).toNumber()
      : v;
  },
  getDefaultUnit = (type, system) => {
    if (!type) return null;
    const unitType = uom[type],
      unitSystem = system || prefferedUnits,
      name = unitType[unitSystem] || unitType.types[0];
    return units[name];
  },
  getUnits = (type) =>
    (uom[type]?.types || []).map((e) => units[e]).filter(Boolean);

const transform = {
    to: (unit, v, translator) => {
      const func = getTranslator(translator), //translate
        val = func ? func(v, translator.value) : v;
      return transformValue(val, unit); //transform
    },
    back: (unit, v, translator) => {
      const val = transformBack(v, unit), //transfrom
        func = getTranslator(translator);
      return func ? func(val, translator.value) : val;
    },
  },
  unitTransformer = {
    //from default to system
    to(v, type, system) {
      const def = uom[type],
        unit = units[def[system]];
      return transformValue(v, unit);
    },
    getLabel(type, system) {
      const def = uom[type],
        unit = units[def[system]];
      return unit?.lbl;
    },
    toDefault: (type, v, translator) => {
      const val = transform.to(getDefaultUnit(type), v, translator);
      return val;
    },
    //from system to default
    from: (v, type, system) => {
      const def = uom[type],
        unit = units[def[system]];
      return transformBack(v, unit);
    },
    fromTo: (from, to, v) => {
      const fromUnit = isString(from) ? units[from] : from,
        toUnit = isString(to) ? units[to] : to,
        base = transformBack(v, fromUnit),
        transfromed = transformValue(base, toUnit);
      return transfromed;
    },
  };

export {
  setUOM,
  init,
  transform,
  unitTransformer,
  units,
  getUnits,
  getDefaultUnit,
};
