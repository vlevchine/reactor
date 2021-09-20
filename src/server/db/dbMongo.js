const mongo = require('mongodb'),
  { MongoClient } = mongo;
const chalk = require('react-dev-utils/chalk'),
  _ = require('lodash');
const indexedCollections = ['formTemplates', 'processTemplates'];

function prepareBulk(items = [], uid, company) {
  const at = new Date();
  return items.map((e) =>
    _.isString(e)
      ? { deleteOne: { filter: { id: e } } }
      : e.createdAt
      ? {
          updateOne: {
            filter: { id: e.id },
            update: {
              $set: Object.assign(e, {
                updatedAt: at,
                updatedBy: uid,
              }),
            },
            upsert: true,
          },
        }
      : {
          insertOne: {
            document: Object.assign(e, {
              createdAt: at,
              createdBy: uid,
              company,
            }),
          },
        }
  );
}
const getPath = (path) =>
    path ? (Array.isArray(path) ? path : path.split('.')) : [],
  drillIn = (obj, e) =>
    Array.isArray(obj)
      ? obj[e] || obj.find((t) => t.id === e || t === e)
      : obj?.[e],
  getIn = (obj = {}, path, exact) => {
    return path || !exact
      ? getPath(path).reduce((acc = {}, e) => {
          return drillIn(acc, e);
        }, obj)
      : undefined;
  },
  setIn = (obj = {}, path, value) => {
    const ids = getPath(path),
      source = _.initial(ids).reduce((acc, id) => {
        let val = drillIn(acc, id);
        if (!val) {
          if (_.isArray(acc)) {
            acc.push({ id });
          } else {
            acc[id] = Object.create(null);
          }
        }
        return drillIn(acc, id);
      }, obj);
    source[_.last(ids)] = value;
  };
const operations = {
    update: (model, { path, value }) => {
      const mod = getIn(model, path);
      Object.assign(mod, value);
    },
    edit: (model, { path, value }) => {
      setIn(model, path, value);
    },
    remove: (model, { path, value }) => {
      const col = getIn(model, path) || [],
        ind = col.findIndex((e) => e.id === value || e === value);
      if (col[ind]) col.splice(ind, 1);
    },
    add: (model, { path, value }) => {
      const pth = getPath(path);
      // if (_.isObject(value) && !value.id) value.id = nanoid(10);
      const src = getIn(model, _.initial(pth)),
        last = _.last(pth);
      if (Array.isArray(src[last])) {
        src[last].push(value);
      } else {
        src[last] = [value];
      }
    },
    move: (model, { path, value }) => {
      const { from, to } = value,
        mod = getIn(model, path),
        src = getIn(mod, from.id),
        tgt = getIn(mod, to.id),
        items = src.splice(from.ind, 1);
      tgt.splice(to.ind, 0, ...items);
    },
  },
  applyPatches = (item, patches = []) => {
    patches.forEach((patch) => {
      operations[patch.op](item, patch);
    });
  };

function getProjection(projection) {
  const props = projection?.split(' ') || [];
  return props.reduce(
    (acc, e) => {
      acc[e] = 1;
      return acc;
    },
    { _id: 0 }
  );
}
const table = {
  collection: null,
  set(col) {
    this.collection = col;
    return this;
  },
  getCollection() {
    return this.collection;
  },
  getCursor(query, options = {}, projection) {
    const { skip, limit, sort } = options;
    let op = this.collection.find(query);
    if (sort) op = op.sort(sort);
    if (skip) op = op.skip(skip);
    if (limit) op = op.limit(limit);
    op.project(getProjection(projection));
    return op;
  },
  async find(query, options, projection) {
    return this.getCursor(query, options, projection).toArray();
  },
  async findWithCount(query, options = {}, projection) {
    const cursor = this.getCursor(query, options, projection);
    return [cursor.toArray(), cursor.count()];
  },
  async findOne(query, project) {
    const projection = getProjection(project),
      res = await this.collection.findOne(query, { projection });
    return res;
  },
  async findById(id, projection) {
    return this.collection.findOne({ id }, getProjection(projection));
  },
  async insertMany(...args) {
    return this.collection.insertMany(...args);
  },
  async count(query) {
    return this.collection.countDocuments(query);
  },
  async insertOne(...args) {
    const { result, ops } = await this.collection.insertOne(...args);
    return { result, value: ops?.[0] };
  },
  async updateOne(query, patch) {
    return this.collection.findOneAndUpdate(
      query,
      { $set: patch },
      { upsert: true, returnOriginal: false }
    );
  },
  async updateMany(...args) {
    return this.collection.updateMany(...args);
  },
  async addOne(item) {
    return this.collection.updateOne(
      { id: item.id },
      { $set: item },
      { upsert: true }
    );
  },
  async addMany(items = []) {
    const req = items.map((e) => ({
      updateOne: {
        filter: { id: e.id },
        update: { $set: e },
        upsert: true,
      },
    }));
    return this.collection.bulkWrite(req);
  },
  bulkWrite(items = [], uid, company) {
    const req = prepareBulk(items, uid, company);
    return this.collection.bulkWrite(req);
  },
  async applyChanges(query, changes, extra) {
    const item = await this.collection.findOne(query, {
      projection: { _id: 0 },
    });
    applyPatches(item, changes);
    Object.assign(item, extra);
    const { modifiedCount } = await this.collection.replaceOne(
      query,
      item
    );
    return { result: modifiedCount, value: item };
  },
  async deleteMany(ids = []) {
    return this.collection.deleteMany({ id: { $in: ids } });
  },
  async deleteOne(id) {
    return this.collection.deleteOne({ id });
  },
};
const target = {
    db: null,
    client: null,
    async init(uri, name) {
      this.client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).catch((err) => {
        console.log(err);
      });
      this.db = this.client.db(name);
      indexedCollections.forEach((e) =>
        this.db.collection(e).createIndex({ id: 1 }, { unique: true })
      );

      console.log(
        chalk.green('Mongo DB connected:', this.db.databaseName)
      );
    },
    async seed(data) {
      if (data.wells) {
        this.db
          .collection('wells')
          .createIndex({ id: 1, location: '2dsphere' });
      }

      return Promise.all(
        Object.keys(data).map(async (e) => {
          await this[e].deleteMany();
          const vals = Object.values(data[e]);
          return this[e].insertMany(vals);
        })
      );
      //this.client.close();
    },
    close() {
      this.client.close();
    },
  },
  models = new Proxy(target, {
    get: (obj, prop) => {
      return obj[prop] || table.set(obj.db.collection(prop)) || {};
    },
  });

//operations to be used directly: insertMany, insertOne, deleteMany, deleteOne, findOne
module.exports = models;
