import { Model, DataTypes } from 'sequelize';

import { sequelize } from '../../utils/sequelize';

class User extends Model {
  declare id: number;
  declare created_at: Date;
  declare username: string;
  declare email: string;
  declare password_hash: string;
}

User.init(
  {
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
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    underscored: true,
    modelName: 'user',
  }
);

export default User;
