// import mongoose, { type ClientSession } from 'mongoose';
import { type Transaction } from 'sequelize';
import { GraphQLError } from 'graphql';

import sequelize from '../config/sequelize';

// interface TransactionParams {
//   run: (
//     sequelizeTransaction: Transaction,
//     mongooseSession: ClientSession
//   ) => Promise<any>;
//   errorMessage: string;
// }

// export const transaction = async ({
//   run,
//   errorMessage,
// }: TransactionParams): Promise<any> => {
//   let sequelizeTransaction;
//   let mongooseSession;
//   try {
//     [sequelizeTransaction, mongooseSession] = await Promise.all([
//       sequelize.transaction(),
//       mongoose.startSession(),
//     ]);
//     mongooseSession.startTransaction();

//     const result = await run(sequelizeTransaction, mongooseSession);

//     await Promise.all([
//       sequelizeTransaction.commit(),
//       mongooseSession.commitTransaction(),
//     ]);
//     return result;
//   } catch (err: any) {
//     await Promise.all([
//       sequelizeTransaction?.rollback(),
//       mongooseSession?.abortTransaction(),
//     ]);

//     const message = err.message ?? errorMessage;
//     throw new GraphQLError(message as string, {
//       extensions: { code: 'INTERNAL_SERVER_ERROR' },
//     });
//   } finally {
//     await mongooseSession?.endSession();
//   }
// };

interface TransactionParams {
  run: (sequelizeTransaction: Transaction) => Promise<any>;
  errorMessage: string;
}

export const transaction = async ({
  run,
  errorMessage,
}: TransactionParams): Promise<any> => {
  let sequelizeTransaction;
  try {
    sequelizeTransaction = await sequelize.transaction();
    const result = await run(sequelizeTransaction);
    await sequelizeTransaction.commit();
    return result;
  } catch (err: any) {
    await sequelizeTransaction?.rollback();
    const message = err.message ?? errorMessage;
    throw new GraphQLError(message as string, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};
