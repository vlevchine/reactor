const model = (sequelize, DataTypes, models) => {
	//Models: Note
	models['Note'] = sequelize.define('Note', {
		text: {
			allowNull: false,
			type: DataTypes.TEXT,
		},
		submitted: {
			allowNull: false,
			type: DataTypes.DATE,
		},
		priority: {
			type: DataTypes.INTEGER,
		}
	});
	models['Note'].associate = (models) => {
		models['Note'].belongsTo(models['Message'], {as: 'message', foreignKey: 'messageId', }); 
	}

	//Models: Message
	models['Message'] = sequelize.define('Message', {
		text: {
			allowNull: false,
			type: DataTypes.TEXT,
		}
	});
	models['Message'].associate = (models) => {
		models['Message'].hasMany(models['Note'], {as: 'comments', foreignKey: 'messageId', }); 
		models['Message'].belongsTo(models['Actor'], {as: 'author', foreignKey: 'actorId', }); 
		models['Message'].belongsToMany(models['Actor'], {as: 'contributors', foreignKey: 'messageId', through: 'MessageContributors', }); 
	}

	return models; 
};

module.exports = model;