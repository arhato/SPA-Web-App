const passport = require('passport');
/*
Function to get the Login Page
*/
exports.getLoginPage = (req, res) => {
  res.render('login', { title: 'Login' });
};

/*
Login Controller
*/
exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
      return next(err); // Passes the error to the error-handling middleware
    }
    if (!user) { 
      req.flash('error', 'Email/Password Invalid!');
      return res.redirect('/login'); // Return to prevent further execution
    }
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); // Passes the error to the error-handling middleware
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.cookie("token", token, { httpOnly: true });
      return res.status(200).json({ message: "Login successful" }); // Return to prevent further execution
    });
  })(req, res, next);
};


/*
Logout Controller
*/
exports.logout = (req, res) => {
  req.logout();
  res.status(200).json({ message: "Logout successful" });
  res.redirect('/login');
};

/*
Middle ware to restrict page access
to logged in users
*/
exports.isLoggedIn = (req, res, next) => {
  // Check if user is authenticated
  if (req.isAuthenticated()) {
    next();
    return;
  }
  res.redirect('/login');
};

/*
Middle ware to restrict Login and Register
Pages to Users not Logged In
*/
exports.notLoggedIn = (req, res, next) => {
  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    next();
    return;
  }
  res.redirect('/profile');
};

