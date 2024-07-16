import User from './user/model';
import OAuth2User from './oauth2_user/model';

User.hasOne(OAuth2User);
OAuth2User.belongsTo(User);
