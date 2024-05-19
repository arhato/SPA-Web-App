// Controllers for User
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const Message = require("../models/message");

const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Function for user registration
exports.createUser = async (req, res) => {
  try {
    // Extract user data from the request body
    const { username, email, password } = req.body;

    // Check if the user already exists in the database
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        // Render the signup page with an error message
        res.redirect('signup', { message: 'Email or username already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

    // Save the new user to the database
    await newUser.save();

    // Redirect to the login page with a success message
    res.status(200).json({ message: "User creation successful" });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// Function for user login
exports.loginUser = async (req, res) => {
  try {
    // Extract username/email and password from the request body
    const { usernameOrEmail, password } = req.body;

    // Find the user by username or email in the database
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    // Check if the user exists
    if (!user) {
      // Render the login page with an error message
      res.status(400).json({ message: "Invalid username or email" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Render the login page with an error message
      res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    // Send message
    res.status(200).json({ message: "Login successful" });
    // Redirect to the home page or any other page
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

//Function to get all user posts
exports.getUserPosts = async (req, res) => {
  const posts = await Post.find({ author: req.user._id });
  res.render('profile', {
    title: 'User Posts',
    posts,
  });
};

//Function to get all user comments
exports.getUserComments = async (req, res) => {
  const comments = await Comment.find({ author: req.user._id });
  res.render('profile', {
    title: 'User Comments',
    comments,
  });
};

exports.userContact = async (req, res) => {
  try {
    // Extract data from the request body
    const { name, email, subject, message } = req.body;

    // Create a new message instance
    const newMessage = new Message({
      name,
      email,
      subject,
      message
    });

    // Save the message to the database
    await newMessage.save();

    // Respond with a success message
    res.status(200).json({ message: "Your message has been sent. Thank you!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
