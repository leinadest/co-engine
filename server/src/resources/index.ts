import User from './user/model';
import OAuth2User from './oauth2_user/model';
import UserFriendRequest from './user_friend_request/model';
import UserFriendship from './user_friendship/model';
import Chat from './chat/model';
import ChatUser from './chat_user/model';
import Message from './message/model';
import UserBlock from './user_block/model';

User.hasOne(OAuth2User);
OAuth2User.belongsTo(User);

UserFriendRequest.belongsTo(User, {
  as: 'sender',
  foreignKey: 'sender_id',
});
UserFriendRequest.belongsTo(User, {
  as: 'receiver',
  foreignKey: 'receiver_id',
});

User.belongsToMany(User, {
  as: 'friendsOfUser',
  through: UserFriendship,
  foreignKey: 'user_id',
});
User.belongsToMany(User, {
  as: 'usersOfFriend',
  through: UserFriendship,
  foreignKey: 'friend_id',
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

UserBlock.belongsTo(User, {
  as: 'users',
  foreignKey: 'user_id',
});
UserBlock.belongsTo(User, {
  as: 'blockedUsers',
  foreignKey: 'blocked_user_id',
});

User.belongsToMany(Chat, {
  as: 'chats',
  through: ChatUser,
  foreignKey: 'user_id',
});
Chat.belongsToMany(User, {
  as: 'users',
  through: ChatUser,
  foreignKey: 'chat_id',
});

ChatUser.belongsTo(Chat, { foreignKey: 'chat_id' });
ChatUser.belongsTo(User, { foreignKey: 'user_id' });

export {
  User,
  OAuth2User,
  UserFriendRequest,
  UserFriendship,
  UserBlock,
  Chat,
  ChatUser,
  Message,
};
