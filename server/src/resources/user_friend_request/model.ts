import { DataTypes, Model, Sequelize } from 'sequelize';

import sequelize from '../../config/sequelize';

class UserFriendRequest extends Model {
  [key: string]: any;
  declare sender_id: number;
  declare receiver_id: number;
  declare created_at: Date;

  static schemaDetails = {
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
  };
}

UserFriendRequest.init(UserFriendRequest.schemaDetails, {
  sequelize,
  timestamps: false,
  underscored: true,
  modelName: 'user_friend_request',
});

export default UserFriendRequest;
