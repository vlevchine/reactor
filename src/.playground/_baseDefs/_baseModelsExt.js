const { generateHash } = appRequire('utils');

const update = (models) => {
  models['User'].beforeCreate(async (user) => {
    const saltRounds = 10;
    user.password = await generateHash(user.password, saltRounds);
  });
  models['User'].validatePassword = async function (user, password) {
    return await bcrypt.compare(password, user.password);
  };

  return models;
};

module.exports = update;
