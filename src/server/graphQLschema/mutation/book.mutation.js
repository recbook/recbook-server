import {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';
import {
  mutationWithClientMutationId
} from 'graphql-relay';

import firebase from '../../util/firebase.util';
import BookAPIUtil from '../../util/books.util';
import UserType from '../type/user.type';
import BookType from '../type/book.type';

import elasticsearch from '../../util/elasticsearch.util';

const BookMutation = {
  saveBook: mutationWithClientMutationId({
    name: 'saveBook',
    inputFields: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      isbn: { type: new GraphQLNonNull(GraphQLString) },
      author: { type: GraphQLString },
      category: { type: GraphQLString },
      thumbnail: { type: GraphQLString },
      thumbnailColor: { type: GraphQLString },
      publisher: { type: GraphQLString },
      publishedDate: { type: GraphQLString }
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload
      }
    },
    mutateAndGetPayload: (args, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          return firebase.refs.booksRef
            .orderByChild('isbn').equalTo(args.isbn).once('value')
            .then((isExistingBookSnap) => {
              if (isExistingBookSnap.val() === null) {
                const newRef = firebase.refs.booksRef.push();
                const newKey = newRef.key;
                const bookObj = { id: newKey, ...args };
                return newRef.set(bookObj)
                  .then(() => {
                    return firebase.refs.booksRef.child(newKey).once('value')
                      .then((snap) => snap.val());
                  });
              }
              const vals = Object.keys(isExistingBookSnap.val())
                .map((key) => isExistingBookSnap.val()[key]);
              return vals[0];
            })
            .then((val) => firebase.refs.savedRef.child(user.id).child(val.id).set(true))
            .then(() => firebase.refs.usersRef.child(user.id).once('value'))
            .then((snap)=> resolve(snap.val()))
            .catch(reject);
        }
        return reject('This mutation needs access token. Please check header.authorization.');
      });
    }
  }),
  unsaveBook: mutationWithClientMutationId({
    name: 'unsaveBook',
    inputFields: {
      book: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload
      }
    },
    mutateAndGetPayload: ({ book }, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          return firebase.refs.savedRef.child(user.id).child(book).remove()
              .then(() => firebase.refs.usersRef.child(user.id).once('value'))
              .then((snap)=> resolve(snap.val()))
              .catch(reject);
        }
        return reject('This mutation needs access token. Please check header.authorization.');
      });
    }
  }),
  searchBookAsyncByTitle: mutationWithClientMutationId({
    name: 'searchBookAsyncByTitle',
    inputFields: {
      query: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      result: {
        type: GraphQLString,
        resolve: (payload) => payload.result
      }
    },
    mutateAndGetPayload: ({ query }, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          resolve({
            result: 'Good. Please check "/bookSearch/{query}" at firebase endpoint.'
          });
          return elasticsearch.client
            .search({ index: elasticsearch.BookIndex, q: query}, (error, response) => {
              if (!error) {
                const promises = response.hits.hits.map((obj) =>
                  firebase.refs.bookSearchRef.child(query).child(obj._source.id).set(obj._source));
                Promise.all(promises);
                BookAPIUtil.asyncSearchAllBooks(query, (book) => {
                  firebase.refs.booksRef
                    .orderByChild('isbn').equalTo(book.isbn).once('value')
                    .then((isExistingBookSnap) => {
                      if (isExistingBookSnap.val() === null) {
                        const newRef = firebase.refs.booksRef.push();
                        const newKey = newRef.key;
                        const bookObj = { id: newKey, ...book };
                        firebase.refs.bookSearchRef.child(query).child(bookObj.id).set(bookObj);
                        return newRef.set(bookObj);
                      }
                      return null;
                    });
                });
              }
              return reject(error);
            });
        }
        return reject('This mutation needs access token. Please check header.authorization.');
      });
    }
  }),
  searchBookByTitle: mutationWithClientMutationId({
    name: 'searchBookByTitle',
    inputFields: {
      query: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      result: {
        type: new GraphQLList(BookType),
        resolve: (payload) => payload
      }
    },
    mutateAndGetPayload: ({ query }, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          return elasticsearch.client.search({index: elasticsearch.const.BookIndex, q: query},
            (error, response) => {
              if (!error) {
                return resolve(response.hits.hits.map((obj) => obj._source));
              }
              return reject(error);
            });
        }
        return reject('This mutation needs access token. Please check header.authorization.');
      });
    }
  })
};

export default BookMutation;
