import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config/environment';
import { User } from '../src/resources';
import bcrypt from 'bcrypt';

const devData: {
  users: Array<Record<string, any>>;
  usersIds: number[];
} = {
  users: [
    ...Array.from({ length: 160 }, (_, i) => ({
      username: `tester${i}`,
      email: `test${i}@gmail.com`,
      password_hash: bcrypt.hashSync('A1!aaaaa', 10),
      is_online: i % 2 === 0,
    })),
  ],
  usersIds: [],
};

const prodData: typeof devData = {
  users: [
    {
      email: 'john@gmail.com',
      username: 'johnd',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'John Doe',
      profile_pic: 'xrydfc8b1lqeg0sdmt5z',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726336224/xrydfc8b1lqeg0sdmt5z.jpg',
      is_online: true,
    },
    {
      email: 'morrison@gmail.com',
      username: 'mor_2314',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'David Morrison',
      profile_pic: 'v1cubspcoch6p1hzivwz',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726336223/v1cubspcoch6p1hzivwz.jpg',
      is_online: false,
    },
    {
      email: 'kevin@gmail.com',
      username: 'kevinryan',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Kevin Ryan',
      profile_pic: 'xcwktk5vr1rp2wkrkual',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726336222/xcwktk5vr1rp2wkrkual.jpg',
      is_online: true,
    },
    {
      email: 'don@gmail.com',
      username: 'donero',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Don Romer',
      profile_pic: 'zbyie1nc1kvhwsxfeko6',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726336221/zbyie1nc1kvhwsxfeko6.jpg',
      is_online: false,
    },
    {
      email: 'derek@gmail.com',
      username: 'derek',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Derek Powell',
      profile_pic: 'samples/man-on-a-street',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1724369452/samples/man-on-a-street.jpg',
      is_online: true,
    },
    {
      email: 'miriam@gmail.com',
      username: 'snyder',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Miriam Snyder',
      profile_pic: 'ehe7p8yfuvpoyxg2oulm',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726336223/ehe7p8yfuvpoyxg2oulm.jpg',
      is_online: true,
    },
    {
      email: 'kate@gmail.com',
      username: 'kate_h',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Kate Hale',
      profile_pic: 'iudjwu9je0grpfojxh3c',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726336222/iudjwu9je0grpfojxh3c.jpg',
      is_online: true,
    },
    {
      email: 'lucy@gmail.com',
      username: 'lucy_h',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Lucy Hall',
      profile_pic: 'fhj3xsetatce2coqne1g',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726336222/fhj3xsetatce2coqne1g.jpg',
      is_online: true,
    },
    {
      email: 'olivia@gmail.com',
      username: 'olivia_w',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Olivia Willis',
      profile_pic: 'g0koc1bf1uqnkmvtnih9',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726336222/g0koc1bf1uqnkmvtnih9.jpg',
      is_online: false,
    },
    {
      email: 'amelia@gmail.com',
      username: 'amelia_g',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Amelia Garcia',
      profile_pic: 'nxwfofriwszq5byytqgq',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726336222/nxwfofriwszq5byytqgq.jpg',
      is_online: true,
    },
    {
      email: 'logan@gmail.com',
      username: 'logan_m',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Logan Mitchell',
      profile_pic: 'whenzigvl3s4iqivtvot',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340343/whenzigvl3s4iqivtvot.jpg',
      is_online: true,
    },
    {
      email: 'penelope@gmail.com',
      username: 'penelope_p',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Penelope Parker',
      profile_pic: 'oc0stfliwu6coscfuv8u',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340344/oc0stfliwu6coscfuv8u.jpg',
      is_online: false,
    },
    {
      email: 'michael@gmail.com',
      username: 'michael_t',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Michael Taylor',
      profile_pic: 'ztfaarpxfqgjqc4xomng',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340343/ztfaarpxfqgjqc4xomng.jpg',
      is_online: true,
    },
    {
      email: 'samantha@gmail.com',
      username: 'samantha_s',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Samantha Sanchez',
      profile_pic: 'eb4y4xwvcrkyzylu2fhq',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340343/eb4y4xwvcrkyzylu2fhq.jpg',
      is_online: false,
    },
    {
      email: 'harrison@gmail.com',
      username: 'harrison_h',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Harrison Hall',
      profile_pic: 'lwzkccjbxw6hp2svdrce',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340343/lwzkccjbxw6hp2svdrce.jpg',
      is_online: true,
    },
    {
      email: 'isabella@gmail.com',
      username: 'isabella_i',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Isabella Ibarra',
      profile_pic: 'ytm7jk7o44sciko6xdqu',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340343/ytm7jk7o44sciko6xdqu.jpg',
      is_online: false,
    },
    {
      email: 'julian@gmail.com',
      username: 'julian_j',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Julian Jackson',
      profile_pic: 'jqmssstsnnb0hyq909gh',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340342/jqmssstsnnb0hyq909gh.jpg',
      is_online: true,
    },
    {
      email: 'aviana@gmail.com',
      username: 'aviana_a',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Aviana Adams',
      profile_pic: 'bdtrq4g4wfca3cxli6cb',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340633/bdtrq4g4wfca3cxli6cb.jpg',
      is_online: false,
    },
    {
      email: 'caleb@gmail.com',
      username: 'caleb_c',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Caleb Carter',
      profile_pic: 'lhyogcrrzztfrbbe26by',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340342/lhyogcrrzztfrbbe26by.jpg',
      is_online: true,
    },
    {
      email: 'evelyn@gmail.com',
      username: 'evelyn_e',
      password_hash: bcrypt.hashSync('Password1!', 10),
      display_name: 'Evelyn Evans',
      profile_pic: 'ugyl5ug7jewtolepcugc',
      profile_pic_url:
        'https://res.cloudinary.com/dzojdkynj/image/upload/v1726340342/ugyl5ug7jewtolepcugc.jpg',
      is_online: false,
    },
  ],
  usersIds: [],
};

const data = NODE_ENV === 'development' ? devData : prodData;

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING USERS... ***');

    const result = await User.bulkCreate(data.users);
    data.usersIds = result.map((user) => user.id);

    console.log(`*** BULK INSERTED USERS RESULT ***`);
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR INSERTING USERS ***');
    console.log(error);
  }
};

export const down = async (): Promise<void> => {
  try {
    if (NODE_ENV === 'development') {
      console.log('*** BULK DELETING USERS... ***');

      const result = await User.destroy({
        where: {
          id: {
            [Op.in]: data.usersIds,
          },
        },
      });

      console.log('*** BULK DELETED USERS RESULT ***');
      console.log(result);
    }
  } catch (error: any) {
    console.log('*** ERROR DELETING USERS ***');
    console.log(error);
  }
};
