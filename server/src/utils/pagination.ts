export const encodeCursor = (cursor: any): string =>
  Buffer.from(JSON.stringify(cursor)).toString('base64');

export const decodeCursor = (cursor: string): any => {
  const cursorValue = JSON.parse(
    Buffer.from(cursor, 'base64').toString('ascii')
  );

  if (!isNaN(Number(cursorValue))) {
    return Number(cursorValue);
  }

  if (!isNaN(Date.parse(cursorValue as string))) {
    return new Date(cursorValue as string);
  }

  return cursorValue;
};
