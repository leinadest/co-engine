import { Model, DataTypes, Sequelize } from 'sequelize';

import sequelize from '../../config/sequelize';

class User extends Model {
  [key: string]: any;
  declare id: number;
  declare created_at: Date;
  declare username: string;
  declare discriminator: string;
  declare display_name: string;
  declare email: string;
  declare password_hash: string;
  declare last_login_at: Date;
  declare is_online: boolean;
  declare profile_pic: string;
  declare profile_pic_url: string;
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
      defaultValue: Sequelize.fn('NOW'),
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discriminator: {
      type: DataTypes.STRING,
    },
    display_name: {
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
    profile_pic_url: {
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
  user.display_name =
    user.display_name ?? `${user.username}#${user.discriminator}`;
});

User.beforeUpdate(async (updatedUser) => {
  if (updatedUser.previous('username') === updatedUser.username) return;
  const usernameCount = await User.count({
    where: { username: updatedUser.username },
  });
  updatedUser.discriminator = usernameCount.toString();
  updatedUser.display_name =
    updatedUser.display_name ??
    `${updatedUser.username}#${updatedUser.discriminator}`;
});

User.beforeBulkCreate(async (users) => {
  const record: Record<string, undefined | number> = {};
  for (const user of users) {
    const incomingUsernameCount = record[user.username] ?? 0;
    record[user.username] = incomingUsernameCount + 1;

    const storedUsernameCount = await User.count({
      where: { username: user.username },
    });

    const totalUsernameCount = storedUsernameCount + incomingUsernameCount;
    user.discriminator = totalUsernameCount.toString();
    user.display_name =
      user.display_name ?? `${user.username}#${user.discriminator}`;
  }
});

export default User;
