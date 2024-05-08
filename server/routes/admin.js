const express = require('express');
const router = express.Router();

//models import
const Post = require('../models/post');
const Comment =require('../models/comment');
const User=require('../models/user');
const Admin=require('../models/admin');

const adminLayout='../views/layouts/admin'

//middleware imports
const { checkLoggedIn } = require('../middlewares/loggedIn');
const bcrypt = require('bcrypt');
const {authenticateAdmin}=require('../middlewares/authAdmin')
const jwt = require('jsonwebtoken');

// Get - Admin Login page
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Blog App with node.js, express and mongo"
        }
        res.render('admin/index', { locals, layout:adminLayout,message:"" });

    } catch (error) {
        console.log(error)
    }
});

// POST - Handle admin login form submission
router.post('/admin/login', async (req, res) => {
    try {
        // Extract username/email and password from the request body
        const { usernameOrEmail, password } = req.body;

        // Find the user by username or email in the database
        const user = await Admin.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });

        // Check if the user exists
        if (!user) {
            // Render the login page with an error message
            res.render('admin/index', { message: 'Invalid username or email' });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            // Render the login page with an error message
            res.render('admin/index', { message: 'Invalid password' });
        }
        
        const token=jwt.sign({userId: user._id},process.env.ADMIN_SECRET)
        res.cookie('tokenAdmin',token,{httpOnly:true});

        // Redirect to the home page or any other page
        res.redirect('/adminHome');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
//GET - Admin dashboard
router.get('/adminHome', authenticateAdmin, async (req, res) => {
    locals={
        title:"Admin",
        description:"Admin Home"
    }
    let limit = 10;
    let page = parseInt(req.query.page) || 1;
    try {
        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);
        const posts = await Post.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.render('admin/adminHome',{
            locals,
            posts,
            currentPage: page,
            totalPages,
            layout:adminLayout
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/recent-posts',authenticateAdmin, async (req, res) => {
    const locals = {
        title: "Recent Post",
        description: "Recent post on the website."
    };
    
    let limit = 10;
    let page = parseInt(req.query.page) || 1;

    try {
        // Calculate the date 25 hours ago
        const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
        
        const totalPosts=await Post.countDocuments({ createdAt: { $gte: twentyFiveHoursAgo } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
        
        const totalPages = Math.ceil(totalPosts / limit);
        // Query posts created in the last 25 hours
        const posts = await Post.find({ createdAt: { $gte: twentyFiveHoursAgo } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        const data=await Post.find();

        res.render('admin/recent-posts', {
            locals,
            posts,
            data,
            currentPage: page,
            totalPages,
            layout:adminLayout 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.clearCookie('tokenAdmin');
        res.redirect('/admin');
    });
});





// // POST - Handle signup form submission
// router.post('/admin/signup', async (req, res) => {
//     try {
//         // Extract user data from the request body
//         const { username, email, password } = req.body;

//         // Check if the user already exists in the database
//         const existingUser = await Admin.findOne({ $or: [{ email }, { username }] });

//         if (existingUser) {
//             // Render the signup page with an error message
//             res.render('/admin/signup', { message: 'Email or username already exists.' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create a new user instance
//         const newAdmin = new Admin({
//             username,
//             email,
//             password: hashedPassword
//         });

//         // Save the new user to the database
//         await newAdmin.save();

//         // Redirect to the login page with a success message
//         res.redirect('/login?signupSuccess=true');
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });



module.exports = router;
