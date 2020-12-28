const model = (sequelize, DataTypes, models) => {
	//Models: Address
	models['Address'] = sequelize.define('Address', {
		type: {
			allowNull: false,
			type: DataTypes.STRING,
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
		}
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
		}
	});
	models['Permission'].associate = (models) => {
		models['Permission'].hasMany(models['Role'], {as: 'roles', foreignKey: 'permissionId', }); 
	}

	//Models: Role
	models['Role'] = sequelize.define('Role', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
		},
		name: {
			allowNull: false,
			type: DataTypes.STRING,
		},
		permissions: {
			list: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
		}
	});
	models['Role'].associate = (models) => {
		models['Role'].belongsTo(models['Permission'], {as: 'permission', foreignKey: 'permissionId', }); 
	}

	//Models: User
	models['User'] = sequelize.define('User', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
		},
		firstName: {
			validate: { isAlphanumeric: true },
			type: DataTypes.STRING,
		},
		lastName: {
			type: DataTypes.STRING,
		},
		inActive: {
			type: DataTypes.BOOLEAN,
		},
		email: {
			validate: { isEmail: true },
			type: DataTypes.STRING,
		},
		username: {
			type: DataTypes.STRING,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
		},
		roles: {
			list: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
		},
		employer: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
		},
		bio: {
			type: DataTypes.JSON,
		}
	});
	models['User'].associate = (models) => {
		models['User'].hasOne(models['Address'], {as: 'address', foreignKey: 'userId', }); 
		models['User'].belongsTo(models['Company'], {as: 'company', foreignKey: 'companyId', }); 
	}

	//Models: Company
	models['Company'] = sequelize.define('Company', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
		},
		name: {
			type: DataTypes.STRING,
		},
		registeredIn: {
			type: DataTypes.STRING,
		},
		description: {
			type: DataTypes.STRING,
		}
	});
	models['Company'].associate = (models) => {
		models['Company'].hasMany(models['User'], {as: 'employees', foreignKey: 'companyId', }); 
		models['Company'].hasOne(models['Address'], {as: 'address', foreignKey: 'companyId', }); 
	}

	//Models: LookupItem
	models['LookupItem'] = sequelize.define('LookupItem', {
		key: {
			allowNull: false,
			type: DataTypes.STRING,
		},
		label: {
			allowNull: false,
			type: DataTypes.STRING,
		}
	});
	models['LookupItem'].associate = (models) => {
		models['LookupItem'].belongsTo(models['Lookups'], {as: 'lookups', foreignKey: 'lookupsId', }); 
	}

	//Models: Lookups
	models['Lookups'] = sequelize.define('Lookups', {
		name: {
			allowNull: false,
			type: DataTypes.STRING,
		}
	});
	models['Lookups'].associate = (models) => {
		models['Lookups'].hasMany(models['LookupItem'], {as: 'items', foreignKey: 'lookupsId', }); 
	}

	//Models: LoginPayload
	models['LoginPayload'] = sequelize.define('LoginPayload', {
		token: {
			type: DataTypes.STRING,
		}
	});
	models['LoginPayload'].associate = (models) => {
		models['LoginPayload'].hasOne(models['User'], {as: 'user', foreignKey: 'loginpayloadId', }); 
	}

	return models; 
};

module.exports = model;