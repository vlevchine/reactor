import { _ } from '@app/helpers';
import { DataObservable } from '@app/utils/observable';
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
class DataResource extends DataObservable {
  constructor(query, dataProvider, logger) {
    super();
    this.provider = dataProvider;
    this.data = Object.create(null);
    this.changes = Object.create(null);
    this.logger = logger;
    this.queries = _.isArray(query) ? query : [query];
  }
  init(schema) {
    this.schema = schema;
    this.query = this.queries.reduce((acc, q) => {
      acc[q.name] = { ...q };
      const fields = schema[q.valueType]?.fields;
      acc[q.name].dateFields = fields
        ?.filter((f) => dateTypes.includes(f.type))
        ?.map((f) => f.name);
      // if (name !== q.name) q.use = name;
      return acc;
    }, Object.create(null));
    return this;
  }
  async fetch(vars) {
    if (!vars) return;
    this.setRunning();
    const qrs = Object.entries(vars).map(([k, v]) => ({
      ...this.query[k],
      vars: v,
    }));
    const info = await this.provider.query(qrs);
    this.setRunning(false);
    if (!info.code)
      this.data = Object.assign(this.data, this.processResult(info));
    return info;
  }
  processResult(data) {
    return Object.keys(data).reduce((acc, name) => {
      const { valueType, dateFields, use } = this.query[name];
      let val = valueType && data[name];

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
      acc[name] = val;
      return acc;
    }, Object.create(null));
  }
  assignResult(d) {
    this.data = this.processResult(d);
  }
  processChange(msg) {
    const src = msg.src,
      [data, change] = process(this.data[src], msg);
    this.data = { ...this.data, [src]: data };
    if (!this.changes[src]) this.changes[src] = [];
    this.changes[src].push(change);
  }
  save(...args) {
    this.provider.mutate(...args).then();
  }
  commitChanges() {}
}

export default DataResource;
