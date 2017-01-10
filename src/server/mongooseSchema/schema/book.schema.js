import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: String,
  category: {
    type: String,
    default: 'Default',
  },
  isbn: String,
  coverImageUrl: String,
  coverImageColor: {
    type: String,
    default: '#000000',
  },
  savedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  publishedAt: Date,
  crawledAt: {
    type: Date,
    default: Date.now,
  },
});

export default bookSchema;
