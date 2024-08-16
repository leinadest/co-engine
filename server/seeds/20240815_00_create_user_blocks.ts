import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config/environment';
import { UserBlock } from '../src/resources';

const devData: { userBlocks: any[]; userBlocksIds: number[] } = {
  userBlocks: [
    ...Array.from({ length: 30 }, (_, i) => ({
      user_id: 1,
      blocked_user_id: i + 92,
    })),
    ...Array.from({ length: 30 }, (_, i) => ({
      user_id: i + 122,
      blocked_user_id: 1,
    })),
  ],
  userBlocksIds: [],
};

const prodData: typeof devData = {
  userBlocks: [{}],
  userBlocksIds: [],
};

const data = NODE_ENV === 'development' ? devData : prodData;

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING USER BLOCKS... ***');

    const result = await UserBlock.bulkCreate(data.userBlocks);
    data.userBlocksIds = result.map((userBlock) => userBlock.user_id);

    console.log(`*** BULK INSERTED USER BLOCKS RESULT ***`);
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR INSERTING USER BLOCKS ***');
    console.log(error);
  }
};

export const down = async (): Promise<void> => {
  try {
    console.log('*** BULK DELETING USER BLOCKS... ***');

    const result = await UserBlock.destroy({
      where: {
        user_id: {
          [Op.in]: data.userBlocksIds,
        },
      },
    });

    console.log('*** BULK DELETED USER BLOCKS RESULT ***');
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR DELETING USER BLOCKS ***');
    console.log(error);
  }
};
