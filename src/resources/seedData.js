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
      company: 'philo',
    },
    {
      firstName: 'Ralph Waldo',
      lastName: 'Emerson',
      email: 'rw.emerson@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geophysist'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Michel',
      lastName: 'Foucault',
      email: 'm.foucault@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['landEngineer'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'David',
      lastName: 'Hume',
      email: 'd.hume@yahoo.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['landManager'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Immanuel',
      lastName: 'Kant',
      email: 'i.kant@yahoo.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geologist', 'landEngineer'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Søren',
      lastName: 'Kierkegaard',
      email: 's.kierkegaard@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geologist', 'landEngineer'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'John',
      lastName: 'Locke',
      email: 'j.locke@yahoo.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geologist', 'geophysist'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Niccolo',
      lastName: 'Machiavelli',
      email: 'n.machiavelli@yahoo.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['landManager'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Karl',
      lastName: 'Marx',
      email: 'k.marx@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geoManager'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'John Stuart',
      lastName: 'Mill',
      email: 'j.s.mill@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['officeManager', 'landManager'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Friedrich',
      lastName: 'Nietzsche',
      email: 'f.nietzsche@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['officeManager'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Jean-Jacques',
      lastName: 'Rousseau',
      email: 'j.j.rousseau@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geophysist', 'geoManager'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Jean-Paul',
      lastName: 'Sartre',
      email: 'j.p.sartre@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['officeManager', 'landManager'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Ludwig',
      lastName: 'Wittgenstein',
      email: 'l.wittgenstein@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['geologist', 'geoManager'],
      employer: 'smart',
      company: 'philo',
    },
    {
      firstName: 'Thomas',
      lastName: 'Aquinas',
      email: 't.aquinas@gmail.com',
      picture: 'https://coudinary.com/absdf',
      roles: ['admin'],
      employer: 'smart',
      company: 'philo',
    },
  ],
  companies = [
    {
      name: 'Philosophers League',
      id: 'philo',
    },
    {
      name: 'Smart approvals Inc.',
      id: 'smart',
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

module.exports = { users, companies, roles };
