// Controllers for Blog
const Blog = require('../models/blog');

// Function for creating blog
const createBlog = async (req, res) => {
  const { title, description, tag, body } = req.body;
  const blog = new Blog({ title, description, tag, author: req.user.id, body });
  blog.save()
    .then(blog => res.json(blog))
    .catch(err => res.status(400).json(err));
};

// Function for getting all blog
const getBlog = (req, res) => {
  const query = req.query;
  Blog.find(query).populate("author")
    .then(blogs => res.json(blogs))
    .catch(err => res.status(400).json(err));
};

// Function for getting one blog
const getBlogById = (req, res) => {
  Blog.findById(req.params.id).populate("author")
    .then(blog => res.json(blog))
    .catch(err => res.status(400).json(err));
};

// Function for updating blog
const updateBlog = (req, res) => {
  Blog.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(blog => res.json(blog))
    .catch(err => res.status(400).json(err));
};

// Function for deleting blog
const deleteBlog = (req, res) => {
  Blog.findByIdAndRemove(req.params.id)
    .then(() => res.json({ message: 'Blog deleted' }))
    .catch(err => res.status(400).json(err));
};

//Export module
module.exports = { createBlog, getBlog, getBlogById, updateBlog, deleteBlog };
