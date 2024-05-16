const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    postId: { type: Schema.ObjectId, ref: "Post" },
    comment: {type: String, required: true},
    author: { type: Schema.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    approved: { type: Boolean, default: false }
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
