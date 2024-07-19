import { DataTypes, Model, Sequelize } from 'sequelize';

import { sequelize } from '../../config/sequelize';

class Chat extends Model {
  declare id: number;
  declare created_at: Date;
  declare name: string;
  declare picture: string;
  declare last_message_at: Date;
  declare last_message_id: string;

  static schemaDetails = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Untitled chat',
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
