const jwt = require('jsonwebtoken'),
  randtoken = require('rand-token'),
  crypto = require('crypto');

const PASSWORD_LENGTH = 256,
  SALT_LENGTH = 64,
  ITERATIONS = 10000,
  DIGEST = 'sha256',
  BYTE_TO_STRING_ENCODING = 'hex'; // this could be base64, for instance

/**
 * Generates a PersistedPassword given the password provided by the user. This should be called when creating a user
 * or redefining the password
 * str -> Promise<PersistedPassword> where
 * PersistedPassword { salt: string; hash: string; iterations: numberv}
 */
const generateHashPassword = async (password) => {
    return new Promise((resolve, reject) => {
      const salt = crypto
        .randomBytes(SALT_LENGTH)
        .toString(BYTE_TO_STRING_ENCODING);
      crypto.pbkdf2(
        password,
        salt,
        ITERATIONS,
        PASSWORD_LENGTH,
        DIGEST,
        (error, hash) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              salt,
              hash: hash.toString(BYTE_TO_STRING_ENCODING),
              iterations: ITERATIONS,
            });
          }
        }
      );
    });
  },
  /**
   * Verifies the attempted password against the password information saved in the database. This should be called when
   * the user tries to log in.
   * (PersistedPassword, passwordAttempt) -> Promise<boolean>
   */
  verifyPassword = async (persistedPassword, passwordAttempt) => {
    return new Promise((accept, reject) => {
      crypto.pbkdf2(
        passwordAttempt,
        persistedPassword.salt,
        persistedPassword.iterations,
        PASSWORD_LENGTH,
        DIGEST,
        (error, hash) => {
          if (error) {
            reject(error);
          } else {
            accept(
              persistedPassword.hash === hash.toString(BYTE_TO_STRING_ENCODING)
            );
          }
        }
      );
    });
  };
const decodeToken = (token) => jwt.decode(token),
  getRandomToken = () => randtoken.uid(256),
  createToken = (obj = sample) =>
    jwt.sign(obj, config.tokenSecret, { expiresIn: config.tokenLife });

var config = {
  port: 3000,
  tokenSecret: 'ssssshhhhh',
  tokenLife: 1440, // expires in 1 hour
  refreshTokenSecret: 'ssssshhhhh',
  refreshTokenLife: 1440 * 72, // expires in 3 days
};
var sample = {
  iss: 'http://emdev.resclients.com:92',
  aud: [
    'http://emdev.resclients.com:92/resources',
    'emapi',
    'LookupApi',
    'WellsManagerApi',
    'WellmanAgentApi',
  ],
  client_id: 'EmWebSiteClient',
  sub: '1b4c2fb3-c3e2-4d4f-8f37-128789a8a42a',
  idp: 'local',
  ClientId: '9a162aca-1fa6-4d71-838d-67f42d4ca9c2',
  UserName: 'DefaultAdmin',
  FirstName: 'sergio',
  LastName: 'diaz',
  email: 'sdiaz@res.com',
  IsActive: 'True',
  OfficePhone: '',
  CellPhone: '',
  OtherPhone: '',
  Language: 'en-CA',
  Remarks: 'user admin default',
  Name: 'sergio diaz',
  DisplayName: 'DefaultAdmin',
  ClientName: 'SHELL CANADA LIMITED',
  impersonator: '',
  CompanyPosition: 'officeAdmin',
  Applications: 'em,wmng',
  subsidiaries:
    '{ "id" : "7effa6a4-98ee-4d76-94d6-7d8ebc89d556", "name": "SHELL CANADA LIMITED"}',
  role: [
    'ddsManager',
    'systemAdmin',
    'engManager',
    'assetManager',
    'fieldReportManager',
    'activityManager',
  ],
  roles: [
    'ddsManager',
    'systemAdmin',
    'engManager',
    'assetManager',
    'fieldReportManager',
    'activityManager',
  ],
  scope: [
    'openid',
    'profile',
    'emapi',
    'LookupApi',
    'WellsManagerApi',
    'WellmanAgentApi',
  ],
  amr: ['pwd'],
};

module.exports = {
  decodeToken,
  getRandomToken,
  createToken,
  generateHashPassword,
  verifyPassword,
};
