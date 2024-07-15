import { Model, DataTypes } from 'sequelize';

import { sequelize } from '../../utils/sequelize';

class OAuth2User extends Model {}

OAuth2User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token_expiration: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: 'oauth2_user',
  }
);

export default OAuth2User;
