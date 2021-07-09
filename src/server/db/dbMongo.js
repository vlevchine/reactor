const mongo = require('mongodb'),
  { MongoClient } = mongo;
const chalk = require('react-dev-utils/chalk');
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
  getCursor(query, options = {}, projection) {
    const { skip, limit, sort } = options;
    let op = this.collection.find(query);
    if (sort) op = op.sort(sort);
    if (skip) op = op.skip(skip);
    if (limit) op = op.limit(limit);
    op.project(getProjection(projection));
    return op;
  },
  find(query, options, projection) {
    return this.getCursor(query, options, projection).toArray();
  },
  findWithCount(query, options = {}, projection) {
    const cursor = this.getCursor(query, options, projection);
    return [cursor.toArray(), cursor.count()];
  },
  async findOne(query, project) {
    const projection = getProjection(project),
      res = await this.collection.findOne(query, {projection});
    return res;
  },
  findById(id, projection) {
    return this.collection.findOne({ id }, getProjection(projection));
  },
  insertMany(...args) {
    return this.collection.insertMany(...args);
  },
  count(query) {
    return this.collection.countDocuments(query);
  },
  async insertOne(...args) {
    const { result, ops } = await this.collection.insertOne(...args);
    return { result, value: ops?.[0] };
  },
  updateMany(...args) {
    return this.collection.updateMany(...args);
  },
  updateOne(query, patch) {
    return this.collection.findOneAndUpdate(
      query,
      { $set: patch },
      { upsert: true, returnOriginal: false }
    );
  },
  deleteMany(query) {
    return this.collection.deleteMany(query);
  },
  deleteOne(query) {
    return this.collection.deleteOne(query);
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
