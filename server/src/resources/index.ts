import User from './user/model';
import OAuth2User from './oauth2_user/model';
import UserFriendship from './user_friendship/model';
import Chat from './chat/model';
import ChatUser from './chat_user/model';
import Message from './message/model';
import UserBlock from './user_block/model';

User.hasOne(OAuth2User);
OAuth2User.belongsTo(User);

User.belongsToMany(User, {
  as: 'friends',
  through: UserFriendship,
  foreignKey: 'sender_id',
  otherKey: 'receiver_id',
});

User.belongsToMany(User, {
  as: 'blocked',
  through: UserBlock,
  foreignKey: 'user_id',
});
User.belongsToMany(User, {
  as: 'blockers',
  through: UserBlock,
  foreignKey: 'blocked_user_id',
});

User.belongsToMany(Chat, {
  through: ChatUser,
  foreignKey: 'user_id',
});
Chat.belongsToMany(User, {
  through: ChatUser,
  foreignKey: 'chat_id',
});

export { User, OAuth2User, UserFriendship, UserBlock, Chat, ChatUser, Message };
