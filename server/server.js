require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./server/db/connect');
const session = require('express-session');
const MongoStore=require('connect-mongo');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT||2000;

// Connect to the database
connectDB()

//middlewares
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
// to pass user object to all templates
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    }),
    cookie:{maxAge:3600000}
}));

app.use(express.static('public'));

// Set up EJS
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// // Routes
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));// // app.use('/', mainRouter);
// app.use('/blogs', blogRouter); // Mount blog routes at /blogs
// app.use('/comments', commentRouter); // Mount comment routes at /comments
// app.use('/users', userRouter); // Mount user routes at /users

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something went wrong!');
// });

app.listen(PORT,'0.0.0.0', () => {
    console.log(`App listening at http://localhost:${PORT}/`);
});