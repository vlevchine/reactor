const mongo = require('mongodb'),
  chalk = require('react-dev-utils/chalk'),
  _ = require('lodash'),
  { applyPatches } = require('./utils');
// import mongo from 'mongodb';
// import chalk from 'react-dev-utils/chalk';
// import _ from 'lodash';

const { MongoClient } = mongo,
  indexedCollections = ['formTemplates', 'processTemplates'];

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
    let item = await this.collection.findOne(query, {
      projection: { _id: 0 },
    });
    if (!item) {
      item = await this.collection.findOne({ id: query.id }, {});
      return {
        error:
          item && item.company !== query.company
            ? 'Not allowed'
            : 'Not found',
      };
    }

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
