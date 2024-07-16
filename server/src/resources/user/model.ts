import { Model, DataTypes } from 'sequelize';

import { sequelize } from '../../config/sequelize';

class User extends Model {
  declare id: number;
  declare created_at: Date;
  declare username: string;
  declare discriminator: string;
  declare email: string;
  declare password_hash: string;
  declare last_login_at: Date;
  declare is_online: boolean;
  declare profile_pic: string;
  declare bio: string;

  static schemaDetails = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discriminator: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    profile_pic: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.STRING,
    },
  };
}

User.init(User.schemaDetails, {
  sequelize,
  timestamps: false,
  underscored: true,
  modelName: 'user',
  indexes: [
    {
      unique: true,
      fields: ['username', 'discriminator'],
    },
  ],
});

User.beforeCreate(async (user) => {
  const usernameCount = await User.count({
    where: { username: user.username },
  });
  user.discriminator = usernameCount.toString();
});

export default User;
