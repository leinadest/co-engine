import { Model, DataTypes } from 'sequelize';

import sequelize from '../../config/sequelize';

class UserFriendship extends Model {
  [key: string]: any;
  declare user_id: number;
  declare friend_id: number;

  static schemaDetails = {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    friend_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  };
}

UserFriendship.init(UserFriendship.schemaDetails, {
  sequelize,
  timestamps: false,
  underscored: true,
  modelName: 'user_friendship',
});

export default UserFriendship;
