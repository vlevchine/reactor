import { gql } from 'apollo-boost';
import { get, pick, mapValues } from '@app/helpers';
import faker from 'faker';
//  { get, isNil, zipObject } = require('lodash'),

const { random, helpers, hacker, date, finance } = faker;
faker.seed(123);
const arrayOf = (count = 0) => [...Array(count).keys()],
  fakers = {
    String: hacker.noun,
    Int: random.number,
    Float: () => parseInt(finance.amount(), 10),
    Boolean: random.boolean,
    ID: random.uuid,
    JSON: helpers.userCard,
    Text: hacker.phrase,
    Date: date.recent,
  };

const parseObject = ({ description, fields }) => ({
    output: description && description.value === 'output',
    fields: fields.map((f) => {
      var res = {
        name: f.name.value,
        list: f.type.kind === 'ListType',
        type: f.type.kind === 'NamedType' && f.type.name.value,
      };
      if (!res.type)
        res.type = res.list
          ? f.type.type.name.value
          : f.type.name.value;
      const dirName = get(f, 'directives.0.name.value'),
        dirv = get(f, 'directives.0.arguments.0');
      if (dirv)
        res[dirName] = mapValues(
          pick(dirv, ['name', 'value']),
          (val) => val.value
        );
      return res;
    }),
  }),
  parseSchema = (schemaStr) => {
    const schema = gql`
        ${schemaStr}
      `,
      types = schema.definitions.reduce(
        (acc, e) => ({ ...acc, [e.name.value]: parseObject(e) }),
        {}
      );
    return types;
  },
  mockField = ({ type, mock = {} }, defs) => {
    const { name, value = '' } = mock,
      vals = value.split(',').map((e) => e.trim());
    if (name === 'faker') return (get(faker, value) || random.word)();
    if (name === 'any') return random.arrayElement(vals);
    if (name === 'between')
      return type === 'Int'
        ? random.number({
            min: parseInt(vals[0]) || 0,
            max: parseInt(vals[1]) || 100,
          })
        : parseFloat(
            finance.amount(
              parseInt(vals[0]) || 1000,
              parseInt(vals[1]) || 100000,
              3
            )
          );
    if (fakers[type]) return fakers[type]();
    return mockObject(defs[type], defs);
  },
  mockObject = (def, defs) =>
    def.fields.reduce((acc, f) => {
      acc[f.name] = f.list
        ? arrayOf(5).map(() => mockField(f, defs))
        : mockField(f, defs);
      return acc;
    }, {}),
  mock = (defs) => {
    const outDef = Object.values(defs).find((e) => e.output);
    if (!outDef || !outDef.fields) throw 'Incorrect schema';

    return mockObject(outDef, defs);
  };

export { parseSchema, mock };
