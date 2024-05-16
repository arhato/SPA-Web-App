const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Configure Passport to use a local strategy for authentication
passport.use(new LocalStrategy(
  { usernameField: 'usernameOrEmail' }, // Specify username field
  async function(usernameOrEmail, password, done) {
    // Find user by username or email in the database
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return done(null, false, { message: 'Invalid username or email' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return done(null, false, { message: 'Invalid password' });
    }

    return done(null, user);
  }
));

// Middleware to serialize and deserialize user
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
const User = mongoose.model('User');

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
