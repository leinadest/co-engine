import User from './user/model';
import OAuth2User from './oauth2_user/model';
import UserFriendship from './user_friendship/model';
import Chat from './chat/model';
import ChatUser from './chat_user/model';

User.hasOne(OAuth2User);
OAuth2User.belongsTo(User);

User.belongsToMany(User, {
  through: UserFriendship,
  as: 'friends',
  foreignKey: 'sender_id',
  otherKey: 'receiver_id',
});

User.belongsToMany(Chat, {
  through: ChatUser,
  foreignKey: 'user_id',
  otherKey: 'chat_id',
});

Chat.belongsToMany(User, {
  through: ChatUser,
  foreignKey: 'chat_id',
  otherKey: 'user_id',
});
