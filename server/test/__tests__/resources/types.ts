export interface SingleGraphQLResponse<ResponseData> {
  body: {
    kind: 'single';
    singleResult: {
      errors?: any[];
      data: ResponseData;
    };
  };
}
