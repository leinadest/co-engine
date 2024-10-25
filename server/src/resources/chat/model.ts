import { DataTypes, Model, Sequelize } from 'sequelize';

import sequelize from '../../config/sequelize';

class Chat extends Model {
  [key: string]: any;
  declare id: number;
  declare creator_id: number;
  declare created_at: Date;
  declare name: string;
  declare picture: string;
  declare last_message_at: Date;
  declare last_message: string;

  static schemaDetails = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    name: {
      type: DataTypes.STRING,
    },
    picture: {
      type: DataTypes.STRING,
    },
    last_message_at: {
      type: DataTypes.DATE,
    },
    last_message: {
      type: DataTypes.STRING,
    },
  };
}

Chat.init(Chat.schemaDetails, {
  sequelize,
  timestamps: false,
  underscored: true,
  modelName: 'chat',
});

export default Chat;
