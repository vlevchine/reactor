const model = (sequelize, DataTypes, models) => {
	//Models: Actor
	models['Actor'] = sequelize.define('Actor', {
		firstName: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true,
		},
		lastName: {
			allowNull: false,
			type: DataTypes.STRING,
		},
		active: {
			type: DataTypes.BOOLEAN,
		},
		born: {
			type: DataTypes.INTEGER,
		},
		started: {
			allowNull: false,
			type: DataTypes.DATE,
		},
		email: {
			validate: { isEmail: true },
			type: DataTypes.STRING,
		},
		userName: {
			allowNull: false,
			type: DataTypes.STRING,
		},
		password: {
			validate: { isAlphanumeric: true },
			allowNull: false,
			type: DataTypes.STRING,
		},
		rate: {
			type: DataTypes.FLOAT,
		},
		uniqueId: {
			allowNull: false,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
		}
	});
	models['Actor'].associate = (models) => {
		models['Actor'].hasOne(models['Preferences'], {as: 'preferences', foreignKey: 'actorId', }); 
		models['Actor'].hasMany(models['Message'], {as: 'messagesCreated', foreignKey: 'actorId', }); 
		models['Actor'].belongsToMany(models['Message'], {as: 'messagesContributed', foreignKey: 'actorId', through: 'MessageContributors', }); 
	}

	//Models: Preferences
	models['Preferences'] = sequelize.define('Preferences', {
		lang: {
			type: DataTypes.STRING,
		},
		units: {
			type: DataTypes.STRING,
		}
	});

	return models; 
};

module.exports = model;