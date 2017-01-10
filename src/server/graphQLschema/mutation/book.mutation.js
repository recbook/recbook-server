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
  GraphQLInputObjectType
} from 'graphql';
import {
  mutationWithClientMutationId,
} from 'graphql-relay';

import GraphQLDate from 'graphql-date';
import mongoose from 'mongoose';

import jwtUtil from '../../util/jwt.util';
import UserType from '../type/user.type';
import BookType from '../type/book.type';

const BookModel = mongoose.model('Book');
const SnippetModel = mongoose.model('Snippet');
const UserModel = mongoose.model('User');

const BookMutation = {
  saveBook: mutationWithClientMutationId({
    name: 'saveBook',
    inputFields: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      author: { type: GraphQLString },
      category: { type: GraphQLString },
      isbn: { type: GraphQLString },
      coverImageUrl: { type: GraphQLString },
      coverImageColor: { type: GraphQLString },
      publishedAt: { type: GraphQLDate },
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload,
      },
    },
    mutateAndGetPayload: (args, { user }) => {
      return new Promise((resolve, reject) => {
        BookModel.findOne({ title: args.title, author: args.author }).exec()
          .then((existingBook) => {
            if (!existingBook) {

              //make new book
              return BookModel.create(args);
            }

            return existingBook;
          })
          .then((book) => {
            return UserModel
              .findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: book._id } },
                { new: true }
              );
          })
          .then(resolve)
          .catch(reject);
      });
    },
  }),
  unsaveBook: mutationWithClientMutationId({
    name: 'unsaveBook',
    inputFields: {
      bookId: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload,
      },
    },
    mutateAndGetPayload: ({ bookId }, { user }) => {
      return new Promise((resolve, reject) => {
        UserModel
          .findOneAndUpdate(
            { _id: user._id },
            { $pull: { savedBooks: bookId } },
            { new: true }
          )
          .then(resolve)
          .catch(reject);
      });
    },
  }),
};

export default BookMutation;
