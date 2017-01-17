import ES from 'elasticsearch';
import firebase from './firebase.util';

const ES_HOST = process.env.ELASTICSEARCH_ENDPOINT;
const client = new ES.Client({
  host: ES_HOST,
  requestTimeout: 6000000
});
const elasticsearchConst = {
  BookIndex: 'book_index',
  BookType: 'book'
};

export default class elasticsearch {
  static get client() {
    return client;
  }

  static get const() {
    return elasticsearchConst;
  }

  static startIndexing() {
    firebase.refs.booksRef.limitToLast(1).on('child_added', this.createOrUpdateIndex);
    firebase.refs.booksRef.on('child_changed', this.createOrUpdateIndex);
    firebase.refs.booksRef.on('child_removed', this.removeIndex);
  }

  static createOrUpdateIndex(snap) {
    client.index({
      index: elasticsearchConst.BookIndex,
      type: elasticsearchConst.BookType,
      id: snap.key,
      body: snap.val()
    }, (error) => {
      if (error) {
        throw new Error(error);
      }
    });
  }

  static removeIndex(snap) {
    client.delete({
      index: elasticsearchConst.BookIndex,
      type: elasticsearchConst.BookType,
      id: snap.key
    }, function (error) {
      if (error) {
        throw new Error(error);
      }
    });
  }

  static eraseBookIndex() {
    client.indices.delete({ index: elasticsearchConst.BookIndex }, () => {
      client.indices.create({ index: elasticsearchConst.BookIndex }, (error) => {
        if (error) {
          throw new Error(error);
        }
      });
    });
  }

  static deleteBookIndex() {
    client.indices.delete({ index: elasticsearchConst.BookIndex }, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
  }

  static createBookIndex() {
    client.indices.create({ index: elasticsearchConst.BookIndex }, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
  }

  static changeBooksChild(snap) {
    const books = snap.val();
    for (const bookId in books) {
      if (books.hasOwnProperty(bookId)) {
        // Do something.....
        if (books[bookId].title && books[bookId].title !== '') {
          books[bookId].title = elasticsearch.removeTag(books[bookId].title);
        }
        if (books[bookId].author && books[bookId].author !== '') {
          books[bookId].author = elasticsearch.removeTag(books[bookId].author);
        }
        if (books[bookId].publisher && books[bookId].publisher !== '') {
          books[bookId].publisher = elasticsearch.removeTag(books[bookId].publisher);
        }
        if (books[bookId].category && books[bookId].category !== '') {
          books[bookId].category = elasticsearch.removeTag(books[bookId].category);
        }
        if (books[bookId].isbn && books[bookId].isbn !== '') {
          books[bookId].isbn = elasticsearch.removeTag(books[bookId].isbn);
        }
      }
    }
    firebase.refs.booksRef.set(books);
  }

  static removeTag(str) {
    return str.replace(/&lt;b&gt;/g, '').replace(/&lt;\/b&gt;/g, '');
  }

}
