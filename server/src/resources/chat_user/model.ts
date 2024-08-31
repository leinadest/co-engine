import { DataTypes, Model } from 'sequelize';

import sequelize from '../../config/sequelize';

class ChatUser extends Model {
  declare chat_id: number;
  declare user_id: number;

  static schemaDetails = {
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'chats',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  };
}

ChatUser.init(ChatUser.schemaDetails, {
  sequelize,
  timestamps: false,
  underscored: true,
  modelName: 'chat_user',
});

export default ChatUser;
