const mongo = require('mongodb'),
  { MongoClient } = mongo;
const chalk = require('react-dev-utils/chalk');

const table = {
  collection: null,
  set(col) {
    this.collection = col;
    return this;
  },
  getCursor(query, options = {}) {
    const { skip, limit, sort = '' } = options,
      sorts = sort.split('-'),
      sorting =
        sorts.length === 2
          ? { [sorts[1]]: -1 }
          : sorts[0]
          ? { [sorts[0]]: 1 }
          : { createdAt: 1 };
    //const project = { _id: 0 }; - second arg to find
    let op = this.collection.find({}, { _id: 0 }).sort(sorting); //query || Object.create(null)
    if (skip) op = op.skip(skip);
    if (limit) op = op.limit(limit);

    return op;
  },
  find(query, options = {}) {
    return this.getCursor(query, options).toArray();
  },
  findWithCount(query, options = {}) {
    const cursor = this.getCursor(query, options);
    return [cursor.toArray(), cursor.count()];
  },
  findOne(query) {
    return this.collection.findOne(query);
  },
  findById(id) {
    return this.collection.findOne({ _id: id });
  },
  insertMany(...args) {
    return this.collection.insertMany(...args);
  },
  count(query) {
    return this.collection.countDocuments(query);
  },
  insertOne(...args) {
    return this.collection.insertOne(...args);
  },
  updateMany(...args) {
    return this.collection.updateMany(...args);
  },
  updateOne(...args) {
    return this.collection.updateOne(...args);
  },
  deleteMany(query) {
    return this.collection.deleteMany(query);
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
      this.db
        .collection('wells')
        .createIndex({ id: 1, location: '2dsphere' });
      return Promise.all(
        Object.keys(data).map(async (e) => {
          await this[e].deleteMany();
          data[e].forEach((d) => {
            d.id && (d._id = d.id);
          });
          return this[e].insertMany(data[e]);
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
