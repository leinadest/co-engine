import { Model, DataTypes, Sequelize } from 'sequelize';

import { sequelize } from '../../utils/sequelize';

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'user',
  }
);

export default User;
