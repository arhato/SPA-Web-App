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
    const posts = await Post.find();
    let id = req.params.id;
    const data = await Post.findById({ _id: id });
    const comments = await Comment.find({ post: data._id }).populate("author");
    const locals = {
      title: data.title,
      description: "Blog App with node.js, express and mongo",
    };
    res.render("post", { locals, posts, data, comments });
  } catch (error) {
    console.log(error);
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

    res.render("category", {
      data,
      posts,
      locals,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.log(error);
  }
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

    res.render("latest-posts", {
      locals,
      posts,
      currentPage: page,
      totalPages,
    });
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

    res.render("search", {
      data,
      locals,
      posts,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error);
  }
};

//Export module
module.exports = { getPosts, getPost, getPostByCategory, getLatestPosts, searchPost};
