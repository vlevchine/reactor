const { generateHash } = appRequire('utils'),
  { nanoid } = require('nanoid');

const users = [
    {
      firstName: 'René',
      lastName: 'Descartes',
      email: 'r.descartes@yahoo.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geologist'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Ralph Waldo',
      lastName: 'Emerson',
      email: 'rw.emerson@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geophysist'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Michel',
      lastName: 'Foucault',
      email: 'm.foucault@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['landEngineer'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'David',
      lastName: 'Hume',
      email: 'd.hume@yahoo.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['landManager'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Immanuel',
      lastName: 'Kant',
      email: 'i.kant@yahoo.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geologist', 'landEngineer'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Søren',
      lastName: 'Kierkegaard',
      email: 's.kierkegaard@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geologist', 'landEngineer'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'John',
      lastName: 'Locke',
      email: 'j.locke@yahoo.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geologist', 'geophysist'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Niccolo',
      lastName: 'Machiavelli',
      email: 'n.machiavelli@yahoo.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['landManager'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Karl',
      lastName: 'Marx',
      email: 'k.marx@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geoManager'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'John Stuart',
      lastName: 'Mill',
      email: 'j.s.mill@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['officeManager', 'landManager'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Friedrich',
      lastName: 'Nietzsche',
      email: 'f.nietzsche@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['officeManager'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Jean-Jacques',
      lastName: 'Rousseau',
      email: 'j.j.rousseau@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geophysist', 'geoManager'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Jean-Paul',
      lastName: 'Sartre',
      email: 'j.p.sartre@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['officeManager', 'landManager'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Ludwig',
      lastName: 'Wittgenstein',
      email: 'l.wittgenstein@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geologist', 'geoManager'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
    {
      firstName: 'Thomas',
      lastName: 'Aquinas',
      email: 't.aquinas@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['admin'],
      employer: 'smart',
      company: 'vlevchine22@gmail.com',
    },
  ],
  companies = [
    {
      name: 'Smart approvals Inc.',
      id: 'smart',
    },
    {
      name: 'Smart approvals Inc.',
      id: 'vlevchine22@gmail.com',
    },
  ],
  roles = [
    {
      id: 'geologist',
      name: 'Geology specialist',
    },
    {
      id: 'geophysist',
      name: 'Geophysics specialist',
    },
    {
      id: 'landEngineer',
      name: 'Land services specialist',
    },
    {
      id: 'landManager',
      name: 'Land services Manager',
    },
    {
      id: 'geoManager',
      name: 'Geo Manager',
    },
    {
      id: 'officeManager',
      name: 'Office Manager',
    },
    {
      id: 'admin',
      name: 'Admin',
    },
  ];
//[companies, roles].forEach((e) => e.forEach((t) => (t._id = t.id)));
users.forEach((e) => (e.id = nanoid(10)));
var psw = '123';

generateHash(psw).then((encrypted) => {
  users.forEach((e) => {
    e.username = e.email.split('@')[0];
    e.password = encrypted;
  });
});

const enhance = (e, i, extra) => {
    var id = String(i + 1);
    return Object.assign(e, { id, _id: id }, extra && { [extra]: i });
  },
  fromName = (name, num) =>
    [...Array(num)].map((_, i) => {
      var id = String(i + 1);
      return { name: `${name} #${id}`, id, _id: id };
    }),
  fromArray = (arr) =>
    arr.map((name, i) => {
      var id = String(i + 1);
      return { name, id, _id: id };
    }),
  costCenterDef = {
    upper: 'Cost Center',
    upperNum: 5,
    lower: 'Account',
    lowerNum: 4,
  },
  lookups = {
    Roles: [
      { name: 'Admin', id: 'admin' },
      { name: 'Power user', id: 'power' },
      { name: 'Field Manager', id: 'field' },
    ],
    JobStatus: fromArray([
      'Not started',
      'In work',
      'Submitted',
      'Rejected/In work',
      'Approved',
    ]),
    Muds: fromName('Mud', 5),
    Films: [
      { title: 'The Shawshank Redemption', year: 1994 },
      { title: 'The Godfather', year: 1972 },
      { title: 'The Godfather: Part II', year: 1974 },
      { title: 'The Dark Knight', year: 2008 },
      { title: '12 Angry Men', year: 1957 },
      { title: "Schindler's List", year: 1993 },
    ].map((e, i) => enhance(e, i, 'rank')),
    Songs: [
      { title: 'Waterloo', year: 1973 },
      { title: 'Let it be', year: 1970 },
      { title: 'Candle in the wind', year: 1975 },
    ].map((e, i) => enhance(e, i, 'rank')),
    CostCenters: [...Array(costCenterDef.upperNum)].map((_, i) => {
      var id = String(i + 1);
      return {
        name: `Cost center #${id}`,
        id,
        _id: id,
        accounts: [...Array(costCenterDef.lowerNum)].map((_, j) => {
          var idd = `${id}.${j + 1}`;
          return { name: `Account #${id}`, id: idd, _id: idd };
        }),
      };
    }),
  };

module.exports = { users, companies, roles, lookups };
