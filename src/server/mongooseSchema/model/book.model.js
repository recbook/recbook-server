import mongoose from 'mongoose';
import BookSchema from '../schema/book.schema';

const BookModel = mongoose.model('Book', BookSchema);

export default BookModel;
