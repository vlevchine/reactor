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
  queryFields = (q) => {
    const flds = q.useFields || q.fields;
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
  queryArgs = (q, args) => {
    if (!args) return '';
    return `(${args
      .map((a) => `${a.name}: $${q}_${a.name}`)
      .join(', ')})`;
  },
  paramList = (qrs, source) => {
    const params = qrs.reduce((acc, q) => {
      const args = source[q.use || q.name]?.args;
      if (args)
        args.forEach((a) =>
          acc.push(`$${q.name}_${a.name}: ${a.type}`)
        );
      return acc;
    }, []);
    return params.length ? `(${params.join(', ')})` : '';
  },
  compose = (qrs = [], { source, oper, opName }) => {
    const queries = Array.isArray(qrs) ? qrs : [qrs];
    const parts =
      '\r\n\t' +
      queries
        .map((q) =>
          [
            q.use ? `${q.name}: ${q.use}` : q.name,
            queryArgs(q.name, source[q.use || q.name]?.args),
            queryFields(q),
          ].join('')
        )
        .join('\r\n\t') +
      '\r\n';

    return `${oper} ${opName}${paramList(
      queries,
      source
    )} {${parts}}`;
  },
  composeVars = (qrs) =>
    qrs.reduce((acc, q) => {
      const name = q.name,
        item = q.vars,
        res = item
          ? Object.keys(item).reduce((acc1, k) => {
              acc1[`${name}_${k}`] = item[k];
              return acc1;
            }, acc)
          : acc;
      if (q.use) {
        res[`${name}_type`] = name;
        const prms = Object.create(null);
        if (q.fields) prms.projection = q.fields;
        if (q.params?.options) prms.options = q.params?.options;
        res[`${name}_params`] = prms;
      }
      return res;
    }, Object.create(null));

const dfltOptions = {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
  },
  fetchOptions = (auth) => {
    const res = { headers: { 'Content-Type': 'application/json' } };
    if (auth) res.headers.Authorization = auth;
    return Object.assign(res, dfltOptions);
  },
  fetchit = async (route = [], params = [], auth) => {
    if (auth?.error) return auth;
    const uri = route.concat(params).filter(Boolean).join('/'),
      options = fetchOptions(auth);
    return fetch(uri, options)
      .then(async (result) => {
        const res = await result.json();
        return {
          code: result.status,
          error: res.error,
          data: result.ok && res,
        };
      })
      .catch(function (err) {
        const er = err,
          { code, message } = er;
        console.log(code, message);
        console.log('Fetch Error :-S', err);
      });
  },
  request = async ({ requestText, variables }, auth, uri) => {
    const headers = { 'Content-Type': 'application/json' },
      req = { query: requestText, variables };
    if (auth.error) return auth;
    if (auth) headers.Authorization = auth;

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

const emptyToken = () => ({ error: 'token not set' });
const provider = {
  get: () => Promise.resolve({}),
  set: (d) => Promise.resolve(d),
  init({ api_uri, gql, queries, mutations }) {
    this.uri = api_uri;
    this.gql_uri = `${api_uri}/${gql}`;
    this.getToken = emptyToken;
    q_options.source = queries;
    m_options.source = mutations;
  },
  handleToken(data = {}) {
    const { access_token, ttl } = data;
    if (access_token) {
      delete data.access_token;
      delete data.ttl;
      this.getToken = function () {
        return `Bearer ${access_token}`;
      };
      setTimeout(
        async (_this) => {
          console.log('Updating access token: ', new Date());
          _this.getToken = emptyToken;
          const res = await fetchit([_this.uri, 'auth', 'refresh']);
          if (res.data) _this.handleToken(res.data);
        },
        ttl,
        this
      );
    }
    return data;
  },
  async query(qrs) {
    const single = !Array.isArray(qrs),
      queries = single ? [qrs] : qrs,
      req = createRequest(queries, q_options);
    let info = await request(req, this.getToken(), this.gql_uri);

    return !info.code && single ? info[qrs.name] : info;
  },
  async mutate(qrs) {
    const req = createRequest(qrs, m_options);
    return request(req, this.getToken(), this.gql_uri);
  },
  async handshake() {
    const res = await fetchit([this.uri, 'auth', 'handshake']);
    return res.data ? this.handleToken(res.data) : res;
  },
  async login(token, provider) {
    const res = await fetchit(
      [this.uri, 'login'],
      [provider],
      `Bearer ${token}`
    );
    return res.data ? this.handleToken(res.data) : res;
  },
  async logout() {
    const res = await fetchit([this.uri, 'auth', 'logout']);
    if (!res.error) {
      this.getToken = emptyToken;
    }
    return res;
  },
  async impersonate({ companyId, userId }) {
    const res = await fetchit(
      [this.uri, 'auth', 'impersonate'],
      [companyId, userId]
    );
    return res.data ? this.handleToken(res.data) : res;
  },
  async refresh() {
    const res = await fetchit([this.uri, 'auth', 'refresh']);
    return res.data ? this.handleToken(res.data) : res;
  },
  async fetch(route) {
    const res = await fetchit(
      [this.uri, route],
      null,
      this.getToken()
    );
    return res.data || res;
  },
};

export default provider;
