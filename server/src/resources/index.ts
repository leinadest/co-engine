import User from './user/model';
import OAuth2User from './oauth2_user/model';
import UserFriendship from './user_friendship/model';

User.hasOne(OAuth2User);
OAuth2User.belongsTo(User);

User.belongsToMany(User, {
  through: UserFriendship,
  as: 'friends',
  foreignKey: 'sender_id',
  otherKey: 'receiver_id',
});
