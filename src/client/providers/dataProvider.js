import { _ } from '@app/helpers'; //, CustomError

// const signinRequest = {
//     name: 'signin',
//     fields: {
//       user: 'name username firstName lastName roles locale uom',
//       company: 'id name',
//       access_token: '',
//       social: 'name email picture locale provider',
//       username: '',
//     },
//   },
//   handshakeRequest = {
//     name: 'handshake',
//     fields: { versions: 'lookups types' },
//   },
//   signoutRequest = { name: 'signout' },
//   impRequest = {
//     name: 'impersonate',
//     fields: {
//       user: 'name username firstName lastName roles locale uom',
//       company: 'id name',
//       access_token: '',
//     },
//   };
const onFieldsString = (s) => (s ? ` {${s}}` : ''),
  queryFields = ({ useFields, fields }) => {
    const flds = useFields || fields;
    return flds
      ? onFieldsString(
          _.isObject(flds)
            ? Object.keys(flds)
                .map((k) => `${k}${onFieldsString(flds[k])}`)
                .join(' ')
            : flds
        )
      : '';
  },
  queryArgs = (name, args) => {
    if (!args) return '';
    return `(${args
      .map((a) => `${a.name}: $${name}_${a.name}`)
      .join(', ')})`;
  },
  paramList = (qrs, source) => {
    const params = qrs.reduce((acc, { spec }) => {
      const { use, name } = spec,
        args = source[use || name]?.args;
      if (args)
        args.forEach((a) =>
          acc.push(`$${name}_${a.name}: ${a.type}`)
        );
      return acc;
    }, []);
    return params.length ? `(${params.join(', ')})` : '';
  },
  compose = (queries = [], { source, oper, opName }) => {
    const parts =
      [
        '',
        ...queries.map(({ spec }) => {
          const { name, use } = spec;
          return [
            use ? `${name}: ${use}` : name,
            queryArgs(name, source[use || name]?.args),
            queryFields(spec),
          ].join('');
        }),
      ].join('\r\n\t') + '\r\n';

    return `${oper} ${opName}${paramList(
      queries,
      source
    )} {${parts}}`;
  },
  merged = (a = {}, b = {}) => ({ ...a, ...b }),
  composeVars = (qrs) =>
    qrs.reduce((acc, { spec, vars }) => {
      const { name, params, fields, use } = spec,
        { options, filter, sort, ...rest } = vars || {},
        res = Object.entries(rest).reduce((acc1, [k, v]) => {
          acc1[`${name}_${k}`] = v;
          return acc1;
        }, acc);
      if (use) {
        const n_params = `${name}_params`,
          sorts = merged(params?.sort, sort),
          opts = merged(params?.options, options);
        res[`${name}_type`] = name;
        res[n_params] = { projection: fields };
        if (!_.isEmpty(opts)) res[n_params].options = opts;
        if (!_.isEmpty(sorts)) res[n_params].sort = sorts;
        if (filter) res[n_params].filter = JSON.stringify(filter);
      }
      return res;
    }, Object.create(null));

const authOptions = { withCredentials: true, credentials: 'include' },
  dfltOptions = {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    mode: 'cors',
  },
  fetchOptions = (options = {}, token) => {
    const opts = {
      ...dfltOptions,
      ...options,
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      }),
    };
    if (opts.body) opts.body = JSON.stringify(opts.body);
    if (token) {
      opts.headers.append('Authorization', `Bearer ${token}`);
      Object.assign(opts, authOptions);
    }
    return opts;
  };

//common functions
const composeUri = (uri, params = {}) => {
  const paramList = Object.entries(params).filter(
    ([, v]) => !_.isNil(v)
  );
  if (!paramList.length) return uri;
  const queryString = paramList
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    )
    .join('&');

  return `${uri}?${queryString}`;
};
export const fetchit = async (uri, options, token) => {
  if (token?.error) return token;
  const opts = fetchOptions(options, token);

  return fetch(uri, opts) //{ method: 'POST', mode: 'cors', headers, body }
    .then(async (response) => {
      const data = await response.json();
      return {
        code: response.status,
        error: data.error,
        data: !data.error && data,
      };
    })
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
      //  return {
      //    message: 'Data request error: ' + err.message,
      //    code: 500,
      //  };
    });
};

export const request = async (
  { requestText, variables },
  token,
  uri
) => {
  const headers = { 'Content-Type': 'application/json' },
    req = { query: requestText, variables };
  if (token.error) return token;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(uri, {
        method: 'post',
        headers,
        body: JSON.stringify(req),
      }),
      { data, errors } = await response.json();
    return errors ? errors[0] : data;
  } catch (err) {
    return {
      message: 'Data request error: ' + err.message,
      code: 500,
    };
  }
};

const q_options = {
    opName: 'get',
    oper: 'query',
  },
  m_options = {
    opName: 'set',
    oper: 'mutation',
  },
  createRequest = (queries, options) => {
    if (!queries.length) return Object.create(null);

    const requestText = compose(queries, options),
      variables = composeVars(queries),
      { oper } = options;
    return {
      oper,
      requestText,
      variables,
    };
    //return request(req, token || this.access_token, social);
  };
// extractData = (res, key) => {
//   const dt = res[key];
//   if (!dt) throw new CustomError(res, 'AuthError');
//   return dt;
// };
// normalizeQueries = (qr) => {
//   const qrs = _.isString(qr) ? { name: qr } : qr;
//   return Array.isArray(qrs) ? qrs : [qrs];
// };

const _emptyToken = { error: 'token not set' };
export const provider = {
  get: () => Promise.resolve({}),
  set: (d) => Promise.resolve(d),
  init({ api_uri, gql }) {
    this.uri = api_uri;
    this.gql_uri = `${api_uri}/${gql}`;
    this.token = _emptyToken;
    this.uri = new URL('auth', api_uri);
    entity.init(api_uri);
  },
  setMeta({ queries, mutations }) {
    q_options.source = queries;
    m_options.source = mutations;
  },
  composeUrl(param) {
    return [this.uri.toString(), param].join('/');
  },
  async query(qrs) {
    const queries = _.isArray(qrs) ? qrs : [qrs],
      req = createRequest(queries, q_options);
    return request(req, this.token, this.gql_uri);
  },
  async mutate(qrs) {
    const req = createRequest(qrs, m_options);
    return request(req, this.token, this.gql_uri);
  },
  handleToken(res) {
    if (!res?.data) return res;
    const { data } = res,
      { access_token, ttl } = data,
      refresh_uri = this.composeUrl('refresh');
    if (access_token) {
      delete data.access_token;
      delete data.ttl;
      this.token = access_token;
      setTimeout(
        async (_this) => {
          console.log('Updating access token: ', new Date());
          _this.token = _emptyToken;
          const res = await fetchit(refresh_uri);
          _this.handleToken(res);
        },
        ttl,
        this
      );
    }
    return data;
  },
  async getAllUsers() {
    const response = await fetchit(this.composeUrl('allusers'));
    return response.error ? response : response.data;
  },
  async handshake() {
    const res = await fetchit(this.composeUrl('handshake'));
    return this.handleToken(res);
  },
  async login(token, authority) {
    const res = await fetchit(
      composeUri(this.composeUrl('login'), { provider: authority }),
      null,
      token
    );
    return this.handleToken(res);
  },
  async logout() {
    const res = await fetchit(this.composeUrl('logout'));
    if (!res.error) {
      this.token = _emptyToken;
    }
    return res;
  },
  async impersonate(info) {
    const res = await fetchit(
      composeUri(this.composeUrl('impersonate'), info)
    );
    return this.handleToken(res);
  },
  async refresh() {
    const res = await fetchit(this.composeUrl('refresh'));
    return this.handleToken(res);
  },
};

function encodeRequest(req) {
  const res = { ...req };
  if (req.filter) res.filter = btoa(JSON.stringify(req.filter));
  return res;
}
export const entity = {
  init(uri) {
    this.uri = new URL('entity', uri);
  },
  async request(vars) {
    const token = provider.token;
    if (!token || token.error) return token;
    //encode filters - TBD??? -encrypt?
    let params;
    if (_.isObject(vars)) {
      const entries = Object.entries(vars);
      entries.forEach((e) => (e[1] = encodeRequest(e[1])));
      params = Object.fromEntries(entries);
    } else {
      params = vars.map(encodeRequest);
    }

    const opts = {
      ...dfltOptions,
      method: 'POST',
      body: JSON.stringify(params),
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        Authorization: `Bearer ${token}`,
      }),
    };
    //{ok, status = 200, statusText}
    const response = await fetch(this.uri, opts);
    if (!response.ok) return response;
    const data = await response.json();
    return data;
  },
  async fetch(from, vars) {
    const res = await fetchit(
      provider.composeUri(from, vars),
      null,
      provider.token
    );
    return res?.data || res;
  },
  async remove(path) {
    const res = await fetchit(
      provider.composeUri(['entity', path]),
      { method: 'DELETE' },
      provider.token
    );
    return res?.data || res;
    //200 (OK). 404 (Not Found), if ID not found or invalid.
  },
  async add(path, item) {
    const res = await fetchit(
      provider.composeUri(['entity', path]),
      { method: 'POST', body: { item } },
      provider.token
    );
    return res?.data || res;
    //201 (Created), 'Location' header with link to /customers/{id} containing new ID.
    //404 (Not Found), 409 (Conflict) if resource already exists..
  },
  async update(path, item) {
    const res = await fetchit(
      provider.composeUri(['entity', path]),
      { method: 'PATCH', body: { item } },
      provider.token
    ); //console.log(from, id);
    return res?.data || res;
    //PUT - update/replace, PATCH - modify
    //201 (Created), 'Location' header with link to /customers/{id} containing new ID.
    //404 (Not Found), 409 (Conflict) if resource already exists..
  },
};

export default provider;
