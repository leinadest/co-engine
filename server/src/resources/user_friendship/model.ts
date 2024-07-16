import { Model, DataTypes } from 'sequelize';

import { sequelize } from '../../config/sequelize';

class UserFriendship extends Model {
  public sender_id!: number;
  public receiver_id!: number;
  public created_at!: Date;
  public accepted_at!: Date;
  public status!: string;

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
      defaultValue: Date.now,
    },
    accepted_at: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted'),
      allowNull: false,
      defaultValue: 'pending',
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
