import type AuthService from '../../services/authService';
import { User } from '..';

class UsersDataSource {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async getBlockedUsers(): Promise<{
    blockedUsers: User[];
    blockedUserIds: number[];
    blockedUserDates: Record<string, Date>;
  }> {
    const blockedUsers = (await User.findAll({
      include: [
        {
          model: User,
          as: 'blockers',
          where: { id: this.authService.getUserId() },
          attributes: ['id'],
          through: { attributes: ['created_at'] },
        },
      ],
    })) as unknown as Array<
      User & {
        blockers: [{ user_block: { created_at: Date } }];
      }
    >;

    const blockedUserIds = blockedUsers.map((user) => user.id);
    const blockedUserDates = blockedUsers.reduce<Record<string, Date>>(
      (acc, user) => {
        acc[user.id] = user.blockers[0].user_block.created_at;
        return acc;
      },
      {}
    );

    return { blockedUsers, blockedUserIds, blockedUserDates };
  }
}

export default UsersDataSource;
