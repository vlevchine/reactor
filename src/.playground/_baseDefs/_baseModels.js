const { generateHash } = appRequire('utils');

const model = (sequelize, DataTypes, models) => {
  //Models: Attribute
  models['Attribute'] = sequelize.define('Attribute', {
    key: {
      type: DataTypes.STRING,
    },
    Value: {
      type: DataTypes.STRING,
    },
  });

  //Models: Address
  models['Address'] = sequelize.define('Address', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    line1: {
      type: DataTypes.STRING,
    },
    line2: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    zip: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
  });

  //Models: Permission
  models['Permission'] = sequelize.define('Permission', {
    name: {
      type: DataTypes.STRING,
    },
    conf: {
      type: DataTypes.JSON,
    },
    description: {
      type: DataTypes.STRING,
    },
  });
  models['Permission'].associate = (models) => {
    models['Permission'].belongsToMany(models['Role'], {
      as: 'roles',
      foreignKey: 'permissionId',
      through: 'RolePermissions',
    });
  };

  //Models: Role
  models['Role'] = sequelize.define('Role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  models['Role'].associate = (models) => {
    models['Role'].belongsToMany(models['Permission'], {
      as: 'permissions',
      foreignKey: 'roleId',
      through: 'RolePermissions',
    });
    models['Role'].belongsToMany(models['User'], {
      as: 'users',
      foreignKey: 'roleId',
      through: 'UserRoles',
    });
  };

  //Models: User
  models['User'] = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      validate: { isAlphanumeric: true },
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
    },
    email: {
      type: DataTypes.STRING,
      validate: { isEmail: true },
    },
    userName: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rate: {
      type: DataTypes.FLOAT,
    },
    bio: {
      type: DataTypes.JSON,
    },
  });
  models['User'].associate = (models) => {
    models['User'].hasOne(models['Address'], {
      as: 'address',
      foreignKey: 'userId',
    });
    models['User'].belongsToMany(models['Role'], {
      as: 'roles',
      foreignKey: 'userId',
      through: 'UserRoles',
    });
  };
  models['User'].beforeCreate(async (user) => {
    const saltRounds = 10;
    user.password = await generateHash(user.password, saltRounds);
  });
  models['User'].validatePassword = async function (user, password) {
    return await bcrypt.compare(password, user.password);
  };

  //Models: Company
  models['Company'] = sequelize.define('Company', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registeredIn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  });
  models['Company'].associate = (models) => {
    models['Company'].hasOne(models['Address'], {
      as: 'address',
      foreignKey: 'companyId',
    });
  };

  //Models: PageInfo
  models['PageInfo'] = sequelize.define('PageInfo', {
    hasNextPage: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    hasPreviousPage: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    startCursor: {
      type: DataTypes.STRING,
    },
    endCursor: {
      type: DataTypes.STRING,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return models;
};

module.exports = model;
