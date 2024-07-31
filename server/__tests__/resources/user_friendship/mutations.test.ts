import sequelize from '../../../src/config/sequelize';
import { UserFriendship, User } from '../../../src/resources';
import AuthService from '../../../src/services/authService';
import { executeOperation } from '../helpers';

describe('User Friendship Mutations Integration Tests', () => {
  const DELETE_FRIENDSHIP = `
    mutation($friendId: ID!) {
      deleteFriendship(friendId: $friendId)
    }`;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true, restartIdentity: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should delete a friendship', async () => {
    // Set up test data
    const users = await User.bulkCreate([
      {
        username: 'test_username',
        email: 'test@email.com',
        password: 'test_password',
      },
      {
        username: 'test_username2',
        email: 'test2@email.com',
        password: 'test_password2',
      },
    ]);
    await UserFriendship.create({
      user_id: users[0].id,
      friend_id: users[1].id,
    });
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;

    // Get result
    const result = await executeOperation(
      DELETE_FRIENDSHIP,
      { friendId: users[1].id.toString() },
      accessToken
    );

    // Assert
    expect(result.data.deleteFriendship).toBe(true);
  });
});
