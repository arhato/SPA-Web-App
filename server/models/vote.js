const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Vote Model
const voteSchema = new Schema({
    answer: { type: Schema.ObjectId, ref: 'Answer' },
    user: { type: Schema.ObjectId, ref: 'User' },
    type: { type: String, enum: ['upvote', 'downvote'] },
});

const Vote = mongoose.model('Vote', voteSchema);
