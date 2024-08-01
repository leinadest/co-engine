import { DataTypes, Model, Sequelize } from 'sequelize';

import sequelize from '../../config/sequelize';

class UserBlock extends Model {
  [key: string]: any;
  declare user_id: number;
  declare blocked_user_id: number;
  declare created_at: Date;

  static schemaDetails = {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    blocked_user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
  };
}

UserBlock.init(UserBlock.schemaDetails, {
  sequelize,
  timestamps: false,
  underscored: true,
  modelName: 'user_block',
});

export default UserBlock;
