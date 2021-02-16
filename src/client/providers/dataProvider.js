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
  composeVars = (qrs) =>
    qrs.reduce((acc, { spec, vars }) => {
      const { name, params, fields, use } = spec,
        { options, filter, ...rest } = vars || {},
        res = Object.entries(rest).reduce((acc1, [k, v]) => {
          acc1[`${name}_${k}`] = v;
          return acc1;
        }, acc);
      if (use) {
        res[`${name}_type`] = name;
        res[`${name}_params`] = Object.assign(Object.create(null), {
          projection: fields,
          options: Object.assign({}, params?.options, options),
          filter: JSON.stringify(filter),
        });
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
  fetchit = async (route = [], params, auth) => {
    if (auth?.error) return auth;
    let uri = route.filter(Boolean).join('/'), //.concat(params)
      options = fetchOptions(auth);
    if (params)
      uri = `${uri}?${new URLSearchParams(params).toString()}`;
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
  init({ api_uri, gql }) {
    this.uri = api_uri;
    this.gql_uri = `${api_uri}/${gql}`;
    this.getToken = emptyToken;
  },
  setMeta({ queries, mutations }) {
    q_options.source = queries;
    m_options.source = mutations;
  },
  handleToken(data) {
    if (!data) return undefined;
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
          _this.handleToken(res?.data);
        },
        ttl,
        this
      );
    }
    return data;
  },
  async query(qrs) {
    const queries = _.isArray(qrs) ? qrs : [qrs],
      req = createRequest(queries, q_options);
    return request(req, this.getToken(), this.gql_uri);
  },
  async mutate(qrs) {
    const req = createRequest(qrs, m_options);
    return request(req, this.getToken(), this.gql_uri);
  },
  async handshake() {
    const res = await fetchit([this.uri, 'auth', 'handshake']);
    return this.handleToken(res?.data) || res;
  },
  async login(token, provider) {
    const res = await fetchit(
      [this.uri, 'login'],
      { provider },
      `Bearer ${token}`
    );

    return this.handleToken(res?.data) || res;
  },
  async logout() {
    const res = await fetchit([this.uri, 'auth', 'logout']);
    if (!res.error) {
      this.getToken = emptyToken;
    }
    return res;
  },
  async impersonate({ companyId, userId }) {
    const res = await fetchit([this.uri, 'auth', 'impersonate'], {
      companyId,
      userId,
    });
    return this.handleToken(res?.data) || res;
  },
  async refresh() {
    const res = await fetchit([this.uri, 'auth', 'refresh']);
    return this.handleToken(res?.data) || res;
  },
  async fetch(route, vars) {
    const res = await fetchit(
      [this.uri, route],
      vars,
      this.getToken()
    );
    return res?.data || res;
  },
};

export default provider;
