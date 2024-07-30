export const encodeCursor = (cursor: any): string =>
  Buffer.from(JSON.stringify(cursor)).toString('base64');

export const decodeCursor = (cursor: string): number | Date | string => {
  const stringCursor = JSON.parse(
    Buffer.from(cursor, 'base64').toString('ascii')
  ) as string;

  if (!isNaN(Number(stringCursor))) {
    return Number(stringCursor);
  }

  if (!isNaN(Date.parse(stringCursor))) {
    return new Date(stringCursor);
  }

  return stringCursor;
};
