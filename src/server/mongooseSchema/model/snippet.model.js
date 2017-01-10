import mongoose from 'mongoose';
import SnippetSchema from '../schema/snippet.schema';

const SnippetModel = mongoose.model('Snippet', SnippetSchema);

export default SnippetModel;
