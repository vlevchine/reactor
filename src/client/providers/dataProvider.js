import { _, CustomError } from '@app/helpers';

const signinRequest = {
    name: 'signin',
    fields: {
      user: 'name username firstName lastName roles locale uom',
      company: 'id name',
      access_token: '',
      social: 'name email picture locale provider',
      username: '',
      versions: 'v_lookups v_types',
    },
  },
  signoutRequest = { name: 'signout' },
  impRequest = {
    name: 'impersonate',
    fields: {
      user: 'name username firstName lastName roles locale uom',
      company: 'id name',
      access_token: '',
    },
  };
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

const request = async ({ uri, requestText, variables }, auth) => {
  const headers = { 'Content-Type': 'application/json' },
    req = { query: requestText, variables };
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
      { uri, oper } = options;
    return {
      uri,
      oper: oper,
      requestText,
      variables,
    };
    //return request(req, token || this.access_token, social);
  },
  extractData = (res, key) => {
    const dt = res[key];
    if (!dt) throw new CustomError(res, 'AuthError');
    return dt;
  };
// normalizeQueries = (qr) => {
//   const qrs = _.isString(qr) ? { name: qr } : qr;
//   return Array.isArray(qrs) ? qrs : [qrs];
// };

const provider = {
  get: () => Promise.resolve({}),
  set: (d) => Promise.resolve(d),
  init(api_uri, queries, mutations) {
    this.uri = api_uri;
    q_options.source = queries;
    q_options.uri = api_uri;
    m_options.source = mutations;
    m_options.uri = api_uri;
  },
  handleToken(data) {
    const access_token = data?.access_token;
    if (access_token) {
      delete data.access_token;
      this.getToken = function () {
        return `Bearer ${access_token}`;
      };
    }
    return data;
  },
  async query(qrs) {
    const single = !Array.isArray(qrs),
      queries = single ? [qrs] : qrs,
      req = createRequest(queries, q_options);
    let info = await request(req, this.getToken());

    return !info.code && single ? info[qrs.name] : info;
  },
  async mutate(qrs) {
    const req = createRequest(qrs, m_options);
    return request(req, this.getToken());
  },
  async login({ token, provider, username }) {
    this.getToken = function () {
      return `${provider} ${token}`;
    };
    const req = createRequest(
        [{ ...signinRequest, vars: { username } }],
        m_options
      ),
      res = await request(req, this.getToken()),
      data = res['signin'];
    return data ? this.handleToken(data) : { error: res };
  },
  async signout() {
    const req = createRequest(
      [{ ...signoutRequest, vars: {} }],
      m_options
    );
    return request(req, this.refresh_token).then((res) => {
      const code = extractData(res, 'code');
      this.getToken = function () {
        return undefined;
      };
      return code;
    });
  },
  async impersonate(loginInfo) {
    const req = createRequest(
      [{ ...impRequest, vars: { loginInfo } }],
      m_options
    );
    const res = await request(req, this.getToken()),
      data = res['impersonate'];
    return data ? this.handleToken(data) : { error: res };
  },
};

export default provider;
