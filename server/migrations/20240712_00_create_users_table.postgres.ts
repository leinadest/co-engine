import { DataTypes, type QueryInterface } from 'sequelize';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  await context.createTable('users', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now,
    },
  });
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('users');
};
