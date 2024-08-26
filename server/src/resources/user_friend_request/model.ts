import {
  DataTypes,
  Model,
  type ModelAttributes,
  type Optional,
  Sequelize,
} from 'sequelize';

import sequelize from '../../config/sequelize';

class UserFriendRequest extends Model {
  [key: string]: any;
  declare sender_id: number;
  declare receiver_id: number;
  declare created_at: Date;

  static schemaDetails: ModelAttributes<
    UserFriendRequest,
    Optional<any, never>
  > = {
    sender_id: {
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
    receiver_id: {
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
