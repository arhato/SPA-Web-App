const express = require('express');
const router = express.Router();


//models import
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');

//middleware imports
const { authenticateUser } = require('../middlewares/authUser')


//controllers
const userController = require('../controllers/userControllers');
const postController = require('../controllers/postControllers');
const commentController = require('../controllers/commentControllers');
const authController = require('../controllers/authController');
//Routes

//GET - home
router.get('', async (req, res) => {
    const locals = {
        title: "Node Blog API",
        description: "Blog App with node.js, express and mongo",
        user: req.user
    }
    try {
        const data = await Post.find();
        res.render('index', { locals, data });

    } catch (error) {
        console.log(error)
    }
});

//about page route
router.get('/about', (req, res) => {
    const locals = {
        title: "About Us",
        description: "Blog App with node.js, express and mongo."
    }
    res.render('about', locals);
});

//contact page route
router.get('/contact', (req, res) => {
    const locals = {
        title: "Contact Us",
        description: "Blog App with node.js, express and mongo."
    }
    res.render('contact', locals);
});

// GET - Render login page
router.get('/login', (req, res) => {
    const locals = {
        title: "Login",
        description: "Blog App with node.js, express and mongo.",
        signupSuccess: req.query.signupSuccess === 'true',
        user: req.user
    }
    res.render('login', { locals, message: '', signupSuccess: null });
});

// POST - Handle login form submission
router.post(
	'/login',
	authController.notLoggedIn,
	authController.login,
);

// GET - Signup page 
router.get('/signup', (req, res) => {
    const locals = {
        title: "Sign Up",
        description: "Blog App with node.js, express and mongo."
    }
    res.render('signup', { locals, message: '' });
});

// POST - Handle signup form submission
router.post('/signup', createUser); 

//POST - category: tags
router.get('/category/:tags', getPostByCategory);

//GET - post:id
router.get('/post/:id', getPost);

//all posts page route
router.get('/latest-posts', getLatestPosts);

//POST - post: searchInput
router.post('/search', searchPost);

// POST - post-comment
router.post('/post-comment', authenticateUser, async (req, res) => {
    try {
        // Extract comment data from the request body
        const { postId, userId, message } = req.body;

        // Find the post based on postId
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the user based on userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new comment
        const comment = new Comment({
            content: message,
            author: user // Assign the user object directly to the comment's author field
        });

        // Save the comment
        await comment.save();

        // Associate the comment with the post
        post.comments.push(comment);
        await post.save();

        res.status(201).json({ message: 'Comment posted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//GET - add post
router.get('/add-post', authenticateUser, async (req, res) => {
    const locals = {
        title: "Add Post",
        description: "Blog App with node.js, express and mongo",
    }
    try {
        res.render('add-post', { locals, message: "" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unauthorized' });
    }
});

// POST route to handle adding a new post
router.post('/add-post', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId;
        // Extract data from the request body
        const { title, body, description, tags } = req.body;
        console.log(req.body);

        // Check if both title and body fields are provided
        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required" });
        }
        // Initialize tags as an empty array
        let tagsArray = [];
        // Check if tags exist and if it's a string before splitting
        if (tags && typeof tags === 'string') {
            tagsArray = tags.split(',');
        }
        // Create a new post instance
        const newPost = new Post({
            title: title,
            body: body,
            author: userId,
            description: description,
            tags: tagsArray,
            comments: [] // Initialize with empty array
        });

        // Save the new post to the database
        await newPost.save();

        // Redirect with message
        res.render('add-post', { message: "Post added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET - Logout route
router.get(
	'/logout',
	authController.isLoggedIn,
	authController.logout,
);


module.exports = router;


// const ObjectId = mongoose.Types.ObjectId; // Import ObjectId from mongoose

//   // Function to select a random author username
//   function getRandomAuthor() {
//       const randomIndex = Math.floor(Math.random() * authors.length);
//       return authors[randomIndex];
//   }
  
// // Function to generate a valid ObjectId for the given username
// function generateAuthorObjectId(username) {
//     // Generate a fixed-length hash from the username
//     const hash = crypto.createHash('md5').update(username).digest('hex');

//     // Ensure the hash is 24 characters long by padding with zeros if necessary
//     const paddedHash = hash.padEnd(24, '0').slice(0, 24);

//     // Create an ObjectId from the padded hash
//     return mongoose.Types.ObjectId.createFromHexString(paddedHash);
// }


//   const blogs = [
//     {
//       title: "The Future of Business in the Digital Age",
//       description: "Exploring the impact of technology on modern business practices.",
//       body: "In today's rapidly evolving digital landscape, businesses are faced with both unprecedented challenges and opportunities. From artificial intelligence and blockchain to data analytics and automation, technology continues to reshape the way companies operate and interact with customers. In this blog post, we delve into the latest trends and innovations driving the future of business, offering insights and strategies for navigating the complexities of the digital age.",
//       author: getRandomAuthor(), // Replace with a valid ObjectId of the author
//       tags: ["Business"],
//       comments: [] // No comments initially
//     },
//     {
//       title: "Cultural Diversity: Celebrating Differences, Embracing Unity",
//       description: "Exploring the richness of cultural diversity and its significance in society.",
//       body: "Culture is the fabric that binds societies together, weaving a tapestry of traditions, beliefs, and values that shape our collective identity. From language and cuisine to music and art, cultural diversity enriches our lives and broadens our perspectives. In this blog post, we celebrate the beauty of cultural diversity, highlighting its importance in fostering understanding, empathy, and unity in an increasingly interconnected world.",
//       author: getRandomAuthor(),
//       tags: ["Culture"],
//       comments: []
//     },
//     {
//       title: "The Power of Sports: Inspiring Greatness, Uniting Nations",
//       description: "Exploring the transformative impact of sports on individuals and societies.",
//       body: "Sports have the unique ability to transcend barriers and bring people together in pursuit of a common goal. Whether on the field or in the stands, the thrill of competition and the camaraderie of teamwork unite us in shared moments of triumph and defeat. In this blog post, we delve into the transformative power of sports, from fostering physical health and mental well-being to promoting social inclusion and global solidarity.",
//       author: getRandomAuthor(),
//       tags: ["Sport"],
//       comments: []
//     },
//     {
//       title: "The Art of Culinary Fusion: Exploring Global Flavors",
//       description: "Embark on a culinary journey around the world.",
//       body: "Food is more than just sustenance; it's a reflection of culture, history, and identity. In today's globalized world, culinary traditions collide and merge, giving rise to innovative and eclectic flavors. From street food stalls in Asia to Michelin-starred restaurants in Europe, join us on a gastronomic adventure as we explore the art of culinary fusion. Discover new tastes, techniques, and ingredients that bridge continents and tantalize the taste buds.",
//       author: getRandomAuthor(),
//       tags: ["Food"],
//       comments: []
//     },
//     {
//       title: "Navigating the Political Landscape: Challenges and Opportunities",
//       description: "Examining the dynamics of politics in a rapidly changing world.",
//       body: "Politics shapes the course of history and the destiny of nations, influencing everything from economic policies to social norms. In an era defined by geopolitical tensions and ideological divides, navigating the political landscape requires vigilance, resilience, and diplomacy. In this blog post, we analyze the complexities of contemporary politics, exploring key issues, trends, and debates that shape our collective future.",
//       author: getRandomAuthor(),
//       tags: ["Politics"],
//       comments: []
//     },
//     {
//       title: "Behind the Scenes: The Lives of Celebrities",
//       description: "Peeling back the curtain on the world of fame and fortune.",
//       body: "Celebrity culture captivates and fascinates us, offering a glimpse into the lives of the rich and famous. From red carpet events to social media scandals, the world of celebrity is a whirlwind of glamour, drama, and intrigue. In this blog post, we go behind the scenes to uncover the reality behind the headlines, exploring the highs and lows of celebrity life and the impact of fame on individuals and society.",
//       author: getRandomAuthor(),
//       tags: ["Celebrity"],
//       comments: []
//     },
//     {
//       title: "Wanderlust: Exploring the World, One Destination at a Time",
//       description: "Embark on a journey of discovery and adventure.",
//       body: "Travel is more than just a means of transportation; it's a transformative experience that broadens horizons, ignites passions, and creates lasting memories. From iconic landmarks to off-the-beaten-path destinations, the world is a playground waiting to be explored. In this blog post, we embark on a virtual journey around the globe, sharing travel tips, stories, and inspiration to fuel your wanderlust and awaken your inner explorer.",
//       author: getRandomAuthor(),
//       tags: ["Travel"],
//       comments: []
//     },
//     {
//         title: "The Art of Coding",
//         description: "Exploring the beauty and intricacies of programming.",
//         body: "Coding is not just about writing lines of code; it's about solving problems creatively and efficiently. In this blog, we delve into various programming concepts, share coding tips, and explore the latest trends in the tech industry. From learning new programming languages to mastering algorithms, join us on a journey to unlock the secrets of the digital world.",
//         author: getRandomAuthor(), // Replace with a valid ObjectId of the author
//         tags: ["coding", "programming", "technology"],
//         comments: [] // No comments initially
//       },
//       {
//         title: "The Changing Face of Business: Adapting to a Digital World",
//         description: "Navigating the challenges and opportunities in the digital business landscape.",
//         body: "The business landscape is undergoing a profound transformation driven by rapid advancements in technology and changing consumer behaviors. From e-commerce and digital marketing to remote work and virtual collaboration, businesses must adapt to stay competitive in an increasingly digital world. In this blog post, we explore the strategies and best practices for thriving in the digital age, from leveraging data analytics to embracing agile methodologies and customer-centric approaches.",
//         author: getRandomAuthor(), // Replace with a valid ObjectId of the author
//         tags: ["Business"],
//         comments: [] // No comments initially
//       },
//       {
//         title: "Preserving Cultural Heritage: The Importance of Cultural Conservation",
//         description: "Examining the significance of preserving cultural heritage for future generations.",
//         body: "Cultural heritage is the cornerstone of identity and belonging, representing the collective memory and heritage of a society. From ancient artifacts and historical sites to intangible traditions and rituals, cultural heritage shapes our understanding of the past and informs our vision for the future. In this blog post, we delve into the importance of cultural conservation, highlighting the efforts to safeguard and promote cultural heritage around the world. From UNESCO World Heritage sites to community-led initiatives, join us in preserving the richness and diversity of our cultural legacy.",
//         author: getRandomAuthor(),
//         tags: ["Culture"],
//         comments: []
//       },
//       {
//         title: "The Thrill of Victory: Exploring the Psychology of Sports",
//         description: "Delving into the psychological aspects of sports performance and competition.",
//         body: "Sports psychology is a fascinating field that explores the mental and emotional factors that influence athletic performance and success. From pre-game rituals and visualization techniques to overcoming adversity and building resilience, the psychology of sports plays a crucial role in helping athletes reach their full potential. In this blog post, we examine the psychological principles behind peak performance, exploring the mindset of champions and the strategies for achieving excellence in sports.",
//         author: getRandomAuthor(),
//         tags: ["Sport"],
//         comments: []
//       },
//       {
//         title: "Culinary Adventures: Exploring the World Through Food",
//         description: "Embark on a culinary journey to discover the diverse flavors of the world.",
//         body: "Food is a universal language that transcends borders and connects people from different cultures and backgrounds. From street food stalls in bustling markets to fine dining restaurants overlooking scenic landscapes, culinary adventures offer a sensory feast for the senses. In this blog post, we embark on a gastronomic journey around the world, sampling exotic dishes, learning traditional cooking techniques, and immersing ourselves in the vibrant flavors and aromas of global cuisine.",
//         author: getRandomAuthor(),
//         tags: ["Food"],
//         comments: []
//       },
//       {
//         title: "Navigating Political Polarization: Bridging Divides in a Divided World",
//         description: "Exploring strategies for fostering dialogue and understanding in an era of political polarization.",
//         body: "Political polarization has become a defining feature of our contemporary society, fueling division and discord across ideological lines. From partisan politics and echo chambers to misinformation and polarization algorithms, navigating the political landscape requires empathy, critical thinking, and constructive dialogue. In this blog post, we explore the root causes of political polarization and offer practical strategies for bridging divides, finding common ground, and rebuilding trust in our democratic institutions.",
//         author: getRandomAuthor(),
//         tags: ["Politics"],
//         comments: []
//       },
//       {
//         title: "Behind the Spotlight: The Real Lives of Celebrities",
//         description: "Examining the complexities of fame and the human side of celebrity culture.",
//         body: "Celebrity culture is often synonymous with glamour and adulation, but behind the spotlight lies a world of pressures, vulnerabilities, and sacrifices. From media scrutiny and paparazzi intrusion to mental health struggles and the dark side of fame, the lives of celebrities are far more complex and nuanced than they appear. In this blog post, we peel back the layers of celebrity culture to reveal the human side of fame, exploring the triumphs and tribulations of life in the public eye.",
//         author: getRandomAuthor(),
//         tags: ["Celebrity"],
//         comments: []
//       },
//       {
//         title: "Off the Beaten Path: Unraveling Hidden Gems in Travel",
//         description: "Discovering hidden gems and off-the-beaten-path destinations for adventurous travelers.",
//         body: "While popular tourist destinations offer their own charm and allure, there's something truly special about uncovering hidden gems and off-the-beaten-path treasures. From secluded beaches and undiscovered villages to hidden waterfalls and breathtaking landscapes, these hidden gems promise a unique and authentic travel experience away from the crowds. In this blog post, we venture off the beaten path to discover the world's best-kept secrets and hidden wonders, inspiring adventurous travelers to explore beyond the tourist trail.",
//         author: getRandomAuthor(),
//         tags: ["Travel"],
//         comments: []
//       }
//     // Add more blogs here...
//   ];
  
//   blogs.forEach(blog => {
//     blog.author = generateAuthorObjectId(blog.author);
// });
// function insertPostData () {
//   Post.insertMany(blogs)
// };
// insertPostData();