const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

// Function to create a new comment
exports.postComment = async (req, res) => {
  try {
    // Extract comment data from the request body
    const { postId, userId, message } = req.body;

    // Find the post based on postId
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the user based on userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new comment
    const comment = new Comment({
      content: message,
      author: user._id, // Assign the user object directly to the comment's author field
      post: post._id,
    });

    // Save the comment
    await comment.save();

    // Associate the comment with the post
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({ message: "Comment posted successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to get all comments for a specific blog post
exports.getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ post: postId }).populate("author");
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Find and delete the comment
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Optionally, remove the comment from the post's comments array
    await Post.updateOne(
      { _id: comment.post },
      { $pull: { comments: commentId } }
    );

    res.status(204).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to edit a comment
exports.editComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const { message } = req.body;

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the comment's content
    comment.content = message || comment.content;

    // Save the updated comment to the database
    await comment.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//Funtion to get all user comments
exports.getUserComments = async (req, res) => {
  const comments = await Comment.find({ author: req.user._id });
  res.render('profile', {
    title: 'User Comments',
    comments,   
  });
};

// Function to verify a comment
exports.verifyComment = async (req, res, next) => {
    try {
      const commentId = req.params.commentId;
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
  
      // Check if the comment belongs to the logged-in user or has necessary permissions
      if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to edit this comment" });
      }
  
      // Pass comment data to the next middleware
      req.comment = comment;
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
