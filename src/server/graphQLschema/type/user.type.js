import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLInterfaceType,
  GraphQLBoolean,
} from 'graphql';

import GraphQLDate from 'graphql-date';

const User = new GraphQLObjectType({
  name: 'User',
  description: 'UserType of Recbook',
  fields: () => ({
    _id: { type: GraphQLString },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    accessToken: {
      description: 'accessToken of user',
      type: GraphQLString,
    },
    createdAt: { type: GraphQLDate },
  }),
});

export default User;
