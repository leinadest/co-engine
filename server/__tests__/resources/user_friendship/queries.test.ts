import sequelize from '../../../src/config/sequelize';
import { UserFriendship, User } from '../../../src/resources';
import AuthService from '../../../src/services/authService';
import { executeOperation } from '../helpers';

describe('User Friendship Queries Integration Tests', () => {
  const GET_FRIENDSHIPS = `
        query {
            userFriendships {
                sender_id
                receiver_id
                created_at
                accepted_at
                status
            }
        }
    `;

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

  it("should return the authenticated user's friendships", async () => {
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
    const friendship = await UserFriendship.create({
      sender_id: users[0].id,
      receiver_id: users[1].id,
    });
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;

    // Define expectation
    const expectedResult = [
      {
        sender_id: users[0].id.toString(),
        receiver_id: users[1].id.toString(),
        created_at: friendship.created_at.toISOString(),
        accepted_at: null,
        status: 'pending',
      },
    ];

    // Execute query and get results
    const result = await executeOperation(GET_FRIENDSHIPS, {}, accessToken);
    const friendships = result.data.userFriendships;

    // Assert
    expect(friendships).toEqual(expectedResult);
  });
});
