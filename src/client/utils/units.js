import Decimal from 'decimal.js'; //-light
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
const transformValue = (v, unit) => {
    const { base, a = 0, b = 1, c = 1 } = unit || Object.create(null),
      value = base
        ? new Decimal(v).times(c).plus(a).dividedBy(b).toNumber()
        : v;
    return value;
  },
  transformBack = (v, unit) => {
    const { base, a = 0, b = 1, c = 1 } = unit || Object.create(null);
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
    ((uom[type] || {}).types || []).map((e) => units[e]);

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
    to: transform.to,
    toDefault: (type, v, translator) => {
      const val = transform.to(getDefaultUnit(type), v, translator);
      return val;
    },
    back: (type, v, translator) =>
      transform.back(getDefaultUnit(type), v, translator),
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
