// Controllers for Blog
const Post = require("../models/post");

// Function to get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to get a single post
exports.getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).populate("author");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Funtion to get post by category
exports.getPostByCategory = async (req, res) => {
  try {
    const slug = req.params.tags;
    const currentPage = parseInt(req.query.page) || 1; // default page to 1 if not provided
    const limit = 10; // set the limit of items per page
    const startIndex = (currentPage - 1) * limit;

    const totalPosts = await Post.countDocuments({ tags: { $in: [slug] } });
    const totalPages = Math.ceil(totalPosts / limit);

    const data = await Post.find({ tags: { $in: [slug] } })
      .limit(limit)
      .skip(startIndex);

    const posts = await Post.find();

    const locals = {
      title: "Category: " + slug,
      description: "Blog App with node.js, express and mongo.",
    };
    res.status(200).json({ 
      data,
      posts,
      locals,
      currentPage,
      totalPages, 
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });  }
};

// Function to get latest posts
exports.getLatestPosts = async (req, res) => {
  const locals = {
    title: "Latest Post",
    description: "Latest post in the website.",
  };
  let limit = 10;
  let page = parseInt(req.query.page) || 1;

  try {
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);
    const posts = await Post.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({ locals, posts, currentPage: page, totalPages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Funtion to search post
exports.searchPost = async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Blog App with node.js, express and mongo.",
    };

    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const page = parseInt(req.query.page) || 1; // default page to 1 if not provided
    const limit = 10; // set the limit of items per page

    const startIndex = (page - 1) * limit;

    // Query the database once to get both data and totalItems
    const [data, totalItems] = await Promise.all([
      Post.find({
        $or: [
          { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
          { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
          { tags: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        ],
      })
        .limit(limit)
        .skip(startIndex),
      Post.countDocuments({
        $or: [
          { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
          { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
          { tags: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        ],
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const posts = await Post.find(); // Not sure if you need all posts for something else
    res.json({ data, locals, posts, currentPage: page, totalPages });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addPost = async (req, res) => {
  try {
    const userId = req.userId;
    // Extract data from the request body
    const { title, body, tags } = req.body;
    console.log(req.body);

    // Check if both title and body fields are provided
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }
    // Initialize tags as an empty array
    let tagsArray = [];
    // Check if tags exist and if it's a string before splitting
    if (tags && typeof tags === "string") {
      tagsArray = tags.split(",");
    }
    // Create a new post instance
    const newPost = new Post({
      title: title,
      body: body,
      author: userId,
      description: description,
      tags: tagsArray,
      comments: [], // Initialize with empty array
    });

    // Save the new post to the database
    await newPost.save();

    res.status(201).json({ message: "Post added successfully", newPost });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Funtions to edit post
exports.editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, body, tags } = req.body;

    // Find the post by ID
    const post = await Post.findById(postId);
    
    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Update the post fields
    post.title = title || post.title;
    post.body = body || post.body;
    post.tags = tags && typeof tags === "string" ? tags.split(",") : post.tags;

    // Save the updated post to the database
    await post.save();

    // Redirect or respond with a success message
    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//Funtion to delete post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Find the post by ID and delete it
    const post = await Post.findByIdAndDelete(postId);

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Respond with a success message
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


//MiddleWare to Verify before Update or delete
exports.verifyPost = async (req, res, next) => {
  const post = await Post.findOne({ _id: req.body.id, author: req.user._id });
  if (!post) {
    res.redirect('/error'); // Send them to 404 page!
    return;
  }
  next();
};

//Function to get data of Post to be updated
exports.updatePost = async (req, res) => {
  const post = await Post.findOneAndUpdate(
    {
      _id: req.body.id,
    },
    req.body,
    { new: true, runValidatos: true },
  ).exec();
  req.flash('success', `Successfully updated ${post.title}`);
  res.redirect(`/post/${post.slug}`);
};
