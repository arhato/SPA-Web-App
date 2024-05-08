// Middleware function to check if the user is logged in
const checkLoggedIn = (req, res, next) => {

    // Check if the user is authenticated
    if (loggedIn) {
        // If logged in, continue with the request
        req.user=loggedInUser;
        next();
    } else {
        // If not logged in, redirect to login page or send an error response
        res.status(401).send('Unauthorized');
    }
};

module.exports={ checkLoggedIn };