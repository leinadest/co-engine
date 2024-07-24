import { DataTypes, Model } from 'sequelize';

import sequelize from '../../config/sequelize';

class ChatUser extends Model {
  declare id: number;
  declare chat_id: number;
  declare user_id: number;
  declare is_creator: boolean;

  static schemaDetails = {
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'chats',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    is_creator: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
