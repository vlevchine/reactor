const { nanoid } = require('nanoid');
const {
  AuthenticationError,
  ForbiddenError,
  ApolloError,
} = require('apollo-server-express');
const { createToken } = require('../utils');

const { TOKEN_SECRET, GOOGLE_CLIENT_ID, APP_NAME } = process.env;

const guardSocial = (auth) => {
  if (!auth) {
    throw new ApolloError('No token.', 417);
  }
  const { iss, email_verified, aud, exp } = auth,
    expired = new Date().valueOf() > parseInt(exp) * 1000;
  if (expired) {
    throw new ApolloError( //unauthorized
      'Your session expired. Sign in again.',
      401
    );
  }
  const valid =
    iss === 'accounts.google.com' &&
    email_verified &&
    aud === process.env.GOOGLE_CLIENT_ID;
  if (!valid) {
    throw new ApolloError( //unauthorized
      'Invalid token or credentials in token',
      401
    );
  }
};
const guard = (auth, guarding) => {
  if (!auth) {
    throw new ApolloError('No token.', 417);
  }
  const { exp, iss, sub } = auth;
  if (Date.now() > exp * 1000) {
    throw new ApolloError( //unauthorized
      'Your session expired. Sign in again.',
      401
    );
  }
  if (!sub) {
    throw new ApolloError('Invalid credentials in token', 401); //unauthorized
  }
  if (iss !== APP_NAME)
    throw new ApolloError('Third-party token.', 400);
  if (guarding && !guarding(auth.roles)) {
    throw new ApolloError( //Forbidden
      'You are not authorized to access this resource',
      403
    );
  }
};
const generateToken = async (session, expires) => {
  const { social, user, company } = session;
  return createToken(
    { user: user?.name, company: company?.id, roles: user?.roles },
    TOKEN_SECRET,
    {
      issuer: GOOGLE_CLIENT_ID,
      audience: APP_NAME,
      subject: social.email,
      expiresIn: Math.floor(expires / 1000),
    }
  );
};
const dummyOK = () => true,
  protect = (func, guard = dummyOK) => (parent, args, ctx) => {
    if (!ctx.auth)
      throw new AuthenticationError('Authentication required');
    if (!guard(ctx.auth)) throw new ForbiddenError('Not authrozed');
    return func(parent, args, ctx);
  };

const person = {
  id: nanoid(10),
  createdAt: new Date(),
  updatedAt: new Date(),
  length: 181.1,
  first: 'Steven',
  last: 'Fry',
  age: 59,
  birthday: new Date().toISOString(),
  height: 1.79,
  weight: 74.8,
  email: 'me2we@gmail.com',
  address: {
    type: 'office',
    city: 'Calgary',
    state: 'AB',
  },
  rate: 10230,
  active: true,
  gain: 0.2,
  gain1: 345610.32,
  // tag: Tag1
  // tags: [Tag]
  release: new Date(Date.UTC(2020, 11, 15, 12)),
  roles: ['admin', 'fieldManager'],
  //assigned: [ID] @ref(data: "users", type: "User")
  film: '2',
  films: ['3', '4', '6'],
  costCenter: '3.4.2', // ID @ref(lookups: "CostCenters")
  // account: ID @ref(lookups: "CostCenters", via: "costCenter@accounts")
  comment: 'this is a comment ...',
};

function capitalize(str) {
  return str.replace(str[0], str[0].toUpperCase());
}

function processWellData(data, items) {
  return Object.entries(data).reduce((acc, [k, v]) => {
    if (k === '__v') return acc;
    const toks = v.split('$#'),
      props =
        toks.length === 1
          ? ['id', 'name']
          : ['id', ...toks[0].split(',')],
      values = toks[toks.length === 1 ? 0 : 1];
    acc[capitalize(k)] = {
      id: k,
      values: values.split(',').map((t) => {
        return t.split(':').reduce(
          (acc, itm, i) => ({
            ...acc,
            [props[i]]: itm,
          }),
          Object.create(null)
        );
      }),
    };
    return acc;
  }, items);
}

function addCostCenters(src) {
  src.CostCenters = {
    id: 'CostCenters',
    values: [...Array(7)].map((_, c) => ({
      name: `Cost Center #${c + 1}`,
      id: c.toString(),
      _id: c.toString(),
      value: [...Array(7)].map((_, a) => ({
        name: `Account #${c + 1}${a + 1}`,
        id: `${c}.${a}`,
        _id: `${c}.${a}`,
        value: [...Array(7)].map((_, s) => ({
          name: `Sub-account #${c + 1}${a + 1}${s + 1}`,
          id: `${c}.${a}.${s}`,
          _id: `${c}.${a}.${s}`,
        })),
      })),
    })),
  };
}

module.exports = {
  guard,
  guardSocial,
  generateToken,
  protect,
  processWellData,
  addCostCenters,
  person,
};
