// Controllers for User
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function for user registration
const createUser = async (req, res) => {
  try {
    // Request data
    const { username, email, password } = req.body;

    // Check if the user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create a new user instance
    const newUser = new User({
      username,
      email,
      password
    });

    // Save the user to the database
    await newUser.save();

    // Send message
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Function for user login
const loginUser = async (req, res) => {
  try {
    // Request data
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is valid
    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Create token for reponse
    const token = await jwt.sign({ user: user }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Add token to the cookies
    res.cookie("token", token, { httpOnly: true}, {maxAge: 60 * 60 * 1000 });

    // Send message
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// Export module
module.exports = { createUser, loginUser };

