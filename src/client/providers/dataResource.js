import { _ } from '@app/helpers';
import { Status } from '@app/utils/observable';
import { process } from '@app/utils/immutable';

const dateTypes = ['Date', 'DateTime'],
  processJSON = (val, reviver) => {
    Object.assign(val, JSON.parse(val.json, reviver));
    val.json = undefined;
    return val;
  },
  toJSON = (e) => (e.json ? processJSON(e) : e),
  processDateFields = (fields = [], e) => {
    fields.forEach((f) => {
      if (e[f]) e[f] = new Date(e[f]);
    });
    return e;
  },
  processItem = (fields) => (e) => {
    return processDateFields(fields, toJSON(e));
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
      (acc, e) => ({ ...acc, [e.name]: new DataResource(e, this) }),
      {}
    );
  }
  init(schema) {
    Object.values(this.resources).forEach((e) => e.init(schema));
    return this;
  }
  set params(pars = {}) {
    Object.entries(this.resources).forEach(([k, v]) => {
      v.params = Object.assign({}, v.query?.params, pars[k]);
      const opts = v.params.options;
      if (opts?.size && !opts.page) opts.page = 1;
    });
  }
  get params() {
    return Object.fromEntries(
      Object.entries(this.resources).map(([k, v]) => [k, v.params])
    );
  }
  setParams(vars) {
    Object.values(this.resources).forEach((r) => r.setParams(vars));
  }
  get data() {
    return Object.entries(this.resources).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: v.data }),
      {}
    );
  }
  async fetch(resource) {
    this.status.set(Status.running);
    const qrs = (resource
      ? [this.resources[resource]]
      : Object.values(this.resources)
    ).map((r) => r.getQuerySpec());
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
  processChange(src, msg) {
    this.resources[src].processChange(msg);
  }
  save(...args) {
    this.provider.mutate(...args).then();
  }
  commitChanges() {}
}

class DataResource {
  constructor(query, parent) {
    this.query = { ...query };
    this.changes = [];
    this.data = Object.create(null);
    this.parent = parent;
  }
  init(meta) {
    this.valueType = meta[this.query.valueType];
    const fields = this.valueType?.fields || {};
    // this.query.schema = _.toObject('name')(fields);
    this.query.dateFields = Object.keys(fields)?.filter((k) =>
      dateTypes.includes(fields[k].type)
    );
  }
  set params(pars) {
    this._params = pars;
  }
  get params() {
    return this._params || {};
  }
  setParams(vars) {
    const name = this.query.name,
      params = vars[name] || {};
    params.options = Object.assign(
      {},
      this.query.params?.options,
      params.options
    );
    if (params.options.size && !params.options.page)
      params.options.page = 1;
    this.params = params;
  }
  getQuerySpec() {
    return { spec: this.query, vars: this.params };
  }
  async fetch(params) {
    Object.assign(this.params, params);
    return this.parent.fetch(this.query.name);
  }
  processResult(data) {
    const { valueType, use, dateFields } = this.query,
      processIt = processItem(dateFields);
    let val = valueType && data;

    if (val?.json) {
      processIt(val);
    } else if (use) {
      const { count, entities } = val;
      let entries = entities || val;
      entries = _.isArray(entries) && entries.map(processIt);
      if (entries)
        val =
          count === undefined
            ? entries
            : { count, entities: entries };
    }
    this.data = val;
  }
  processChange(msg) {
    const [data, change] = process(this.data, msg);
    this.data = data;
    this.changes.push(change);
  }
}
