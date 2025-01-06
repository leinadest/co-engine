export function formatError(error: any) {
  // Handle errors without cause
  if (!('cause' in error))
    return {
      code: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again later.',
    };

  // Handle non-coded server errors
  if (error.cause.name === 'ServerError') {
    return {
      code: 'Server Error',
      message: error.cause.result,
    };
  }

  // Handle non-coded errors
  if (!('code' in error.cause) && error.networkError) {
    return {
      code: 'Network Error',
      message:
        'An error occurred while making a network request. Please try again later.',
    };
  }

  if (!('code' in error.cause) && error.graphQLErrors.length) {
    return {
      code: 'Graphql Error',
      message:
        'An error occurred while processing your GraphQL request. Please try again.',
    };
  }

  if (!('code' in error.cause) && error.clientErrors.length) {
    return {
      code: 'Client Error',
      message:
        'An error occurred while processing your request. Please try again.',
    };
  }

  if (!('code' in error.cause) && error.protocolErrors.length) {
    return {
      code: 'Protocol Error',
      message:
        'An error occurred while processing your request. Please try again later.',
    };
  }

  if (!('code' in error.cause)) {
    return {
      code: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }

  // Handle coded errors
  const { code } = error.cause;

  switch (code) {
    case 'UNAUTHENTICATED':
      return {
        code: 'Unauthenticated',
        message: 'You must be logged in to access this page.',
      };
    case 'FORBIDDEN':
      return {
        code: 'Forbidden',
        message: 'You do not have permission to access this page.',
      };
    case 'NOT_FOUND':
      return {
        code: 'Not Found',
        message: 'The requested resource was not found.',
      };
  }

  return {
    code,
    message: error.message,
  };
}
