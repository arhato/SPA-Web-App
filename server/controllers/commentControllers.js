// Controllers for comments
const Comment = require('../models/comment');

// Function to create a new comment
const createComment = async (req, res) => {
    try {
        const { content, blog } = req.body;
        const userId = req.user._id;
        const comment = await Comment.create({ content, author: userId, blog });
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to get all comments for a specific blog
const getCommentsByBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const comments = await Comment.find({ blog: blogId }).populate('author');
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to delete a comment
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        await Comment.findByIdAndDelete(commentId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Module export
module.exports = { createComment, getCommentsByBlog, deleteComment }
