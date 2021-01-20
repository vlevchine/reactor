import { _ } from '@app/helpers';
import { Status } from '@app/utils/observable';
import { process } from '@app/utils/immutable';

const dateTypes = ['Date', 'DateTime'],
  processJSON = (val, reviver) => {
    Object.assign(val, JSON.parse(val.json, reviver));
    delete val.json;
    return val;
  },
  processDates = (v) => {
    //TBD??? keep dates as ISO strings? (v, fields = [])
    // Object.keys(v).forEach((k) => {
    //   if (fields.includes(k)) v[k] = new Date(v[k]);
    // });
    return v;
  };
// reviver = (types, key, value) => {
//   if (types.includes(key)) {
//     return value.slice(0, 10);
//   }
//   return value;
// };
export default class DataResourceCollection {
  constructor(query = [], dataProvider, logger) {
    this.provider = dataProvider;
    this.logger = logger;
    this.status = Status.create();
    const queries = _.isArray(query) ? query : [query];
    this.resources = queries.reduce(
      (acc, e) => ({ ...acc, [e.name]: new DataResource(e) }),
      {}
    );
  }
  init(schema) {
    // this.schema = schema;
    // this.query = this.queries.reduce((acc, q) => {
    //   acc[q.name] = { ...q };
    //   const fields = schema[q.valueType]?.fields;
    //   acc[q.name].dateFields = fields
    //     ?.filter((f) => dateTypes.includes(f.type))
    //     ?.map((f) => f.name);
    //   // if (name !== q.name) q.use = name;
    //   return acc;
    // }, Object.create(null));
    Object.values(this.resources).forEach((e) => e.init(schema));
    return this;
  }
  get data() {
    return Object.entries(this.resources).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: v.data }),
      {}
    );
  }
  async fetch(vars) {
    if (!vars) return;
    this.status.set(Status.running);
    const qrs = Object.entries(vars).map(([k, v]) => ({
      ...this.resources[k].query,
      vars: v,
    }));
    const info = await this.provider.query(qrs);
    if (!info.code) {
      Object.entries(info).forEach(([k, v]) =>
        this.resources[k].processResult(v)
      );
      this.status.set(Status.success);
    } else this.status.set(Status.error);
    //this.data = Object.assign(this.data, this.processResult(info));
    return info;
  }
  // processResult(data) {
  //   return Object.entries(data).forEach((k, v) =>
  //     this.resources[k].processResult(v)
  //   );
  // }
  // assignResult(d) {
  //   this.data = this.processResult(d);
  // }
  processChange(src, msg) {
    this.resources[src].processChange(msg);
  }
  save(...args) {
    this.provider.mutate(...args).then();
  }
  commitChanges() {}
}

class DataResource {
  constructor(query) {
    this.query = { ...query };
    this.changes = [];
    this.data = Object.create(null);
  }
  init(schema) {
    const fields = schema[this.query.valueType]?.fields || [];
    this.query.dateFields = fields
      ?.filter((f) => dateTypes.includes(f.type))
      ?.map((f) => f.name);
  }
  processResult(data) {
    const { valueType, dateFields, use } = this.query;
    let val = valueType && data;

    if (val?.json) {
      processDates(processJSON(val), dateFields);
    } else if (use) {
      const count = val.count,
        enties = val.entities || val,
        entities =
          _.isArray(enties) &&
          enties.map((e) =>
            processDates(e.json ? processJSON(e) : e, dateFields)
          );
      if (entities) val = count ? { count, entities } : entities;
    }
    this.data = val;
  }
  processChange(msg) {
    const [data, change] = process(this.data, msg);
    Object.assign(this.data, data);
    this.changes.push(change);
  }
}
