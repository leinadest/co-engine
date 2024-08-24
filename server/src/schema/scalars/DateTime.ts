import { GraphQLScalarType, Kind } from 'graphql';
import { gql } from 'graphql-tag';
import { DateTime } from 'luxon';

const isValidDateTime = (value: any): boolean => {
  const isSerializable =
    DateTime.fromJSDate(value as Date).isValid ||
    typeof value === 'string' ||
    typeof value === 'number';
  return isSerializable;
};

const config = {
  name: 'DateTime',
  description:
    'A date-time string at UTC, such as 2007-12-03T10:15:30Z, ' +
    'compliant with the `date-time` format outlined in section 5.6 of ' +
    'the RFC 3339 profile of the ISO 8601 standard for representation ' +
    'of dates and times using the Gregorian calendar.',
  // Serialize query response result on the backend
  serialize(value: any) {
    if (isValidDateTime(value)) {
      return new Date(value as Date).toISOString();
    }

    throw new TypeError(
      `DateTime can not be serialized from ${JSON.stringify(value)}`
    );
  },
  // Parse query variable object on the backend
  parseValue(value: any) {
    if (isValidDateTime(value)) {
      return new Date(value as Date);
    }

    throw new TypeError(
      `DateTime can not be parsed from ${JSON.stringify(value)}`
    );
  },
  // Parse query variable literal on the backend
  parseLiteral(ast: any) {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError(
        `DateTime cannot represent non string type ${String(
          ast.value !== null ? ast.value : null
        )}`
      );
    }

    const { value } = ast;

    if (isValidDateTime(value)) {
      return new Date(value as Date);
    }

    throw new TypeError(
      `DateTime can not be parsed from ${JSON.stringify(value)}`
    );
  },
};

export const resolvers = {
  DateTime: new GraphQLScalarType(config),
};

export const typeDefs = gql`
  scalar DateTime
`;

export default {
  resolvers,
  typeDefs,
};
