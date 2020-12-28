const faker = require('faker'),
  { random, helpers, hacker, date } = faker, //, company, internet
  { get, isNil, zipObject } = require('lodash'),
  { typeAliases } = require('./schemaProcessor');

faker.seed(123);
const arrayOf = (count = 0) => [...Array(count).keys()],
  stringToArray = (str, sep = '.') => str.split(sep).map((e) => e.trim());
fakers = {
  STRING: hacker.noun,
  INTEGER: random.number,
  FLOAT: random.number,
  JSON: helpers.userCard,
  TEXT: hacker.phrase,
  DATE: date.recent,
};

const seedProp = (def = {}, type) => {
    let res,
      { use, any, prefix } = def;

    if (any) {
      res = random.arrayElement(any);
    } else {
      const fn = get(faker, use) || fakers[type] || fakers[typeAliases[type]];

      if (fn)
        res =
          type === 'JSON'
            ? JSON.stringify(fn())
            : prefix
            ? `${prefix}_${fn()}`
            : fn(); //seedObject(models[v.type].fake, models);
    }

    return res;
  },
  seedObject = (fields = {}, name, val) => {
    const res = Object.entries(fields).reduce((acc, [k, v]) => {
      var { type, model, fake } = v;
      if (model.virtual) return acc;
      const val = v.list
        ? arrayOf(parseInt(fake.length) || 5).map((_) => seedProp(fake, type))
        : seedProp(fake, type);
      if (!isNil(val)) {
        acc[k] = val;
      }
      return acc;
    }, {});
    if (name && val) res[name] = val;
    return res;
  },
  seedModel = (key, modelDefs, withDir) => {
    const mod = modelDefs[key],
      typeFake = mod.type.fake || {},
      [withName, withVals] = withDir,
      count = withVals ? withVals.length : parseInt(typeFake.count, 10) || 4;
    return count
      ? arrayOf(count).map((i) =>
          seedObject(mod.fields, withName, withVals && withVals[i])
        )
      : [seedObject(mod)];
  },
  randomDraw = (n, m = 1) => {
    const a = arrayOf(n),
      r = [];
    for (i = 0; i < m; ++i) {
      var j = Math.floor(Math.random() * (n - i));
      r.push(a[j]);
      a[j] = a[n - i - 1];
    }
    return r;
  },
  seedData = async (modelDefs, types, logger) => {
    const entityTypes = Object.keys(types),
      data = entityTypes.map((e) => {
        var fake = modelDefs[e].type.fake || {},
          withDir = (fake.with || '')
            .split(':')
            .map((w) => w.split(',').map((i) => i.trim())),
          res = seedModel(e, modelDefs, withDir);
        return res;
      }),
      entries = await Promise.all(
        entityTypes.map((e, i) =>
          types[e].bulkCreate(data[i], { individualHooks: true })
        )
      ),
      entities = zipObject(entityTypes, entries);

    await Promise.all(
      entityTypes.map((e, i) => {
        var entityFakes = entities[e],
          model = modelDefs[e];
        return Promise.all(
          Object.entries(types[e].associations).map(([k, assoc]) => {
            var fakeDef = model.type.fake || {},
              modelAssoc =
                (model.associations || []).find((e) => e.as === assoc.as) || {},
              { associationType, accessors, target } = assoc;
            if (
              associationType === 'HasMany' ||
              (associationType === 'BelongsToMany' && !modelAssoc.init)
            )
              return;
            var setMethod = accessors.set,
              targetFakes = entities[target.name],
              isOne = associationType === 'HasOne';

            return Promise.all(
              entityFakes.map((m, i) => {
                if (isOne) {
                  return m[setMethod](targetFakes[i]);
                } else {
                  var draws = randomDraw(targetFakes.length, 1);
                  return m[setMethod](targetFakes[draws[0]]);
                }
              })
            );
          })
        );
      })
    );

    logger('Database seeded!');
  };

module.exports = { seedData };
