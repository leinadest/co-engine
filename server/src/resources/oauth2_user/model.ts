import { Model, DataTypes } from 'sequelize';

import sequelize from '../../config/sequelize';

class OAuth2User extends Model {
  public oauth2_user_id!: string;
  public user_id!: number;
  public access_token!: string;
  public refresh_token!: string;

  static schemaDetails = {
    oauth2_user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
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
    },
  };
}

OAuth2User.init(OAuth2User.schemaDetails, {
  sequelize,
  timestamps: false,
  underscored: true,
  modelName: 'oauth2_user',
});

export default OAuth2User;
