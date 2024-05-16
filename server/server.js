
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/connect');
const MongoStore = require('connect-mongo'); 
const passport = require('passport');
const cors=require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT||2000;

// Connect to the database
connectDB()

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

// // to pass user object to all templates
// app.use((req, res, next) => {
//     res.locals.user = req.user;
//     next();
// });

// Set up express-session middleware
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 3600, // Session TTL in seconds (1 hour)
        autoRemove: 'native' // Automatically remove expired sessions
    }),
    cookie: { maxAge: 3600000 } // Session cookie expiry time (1 hour)
}));


// Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', require('./routes/main'));

app.get("/", (req, res) => {
    res.send("Hello from Node API Server Updated");
});
// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
app.listen(PORT,'0.0.0.0', () => {
    console.log(`App listening at http://localhost:${PORT}/`);
});