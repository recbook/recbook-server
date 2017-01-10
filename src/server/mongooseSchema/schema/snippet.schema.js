import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  contents: {
    type: String,
    required: true,
  },
  page: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  savedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default snippetSchema;
