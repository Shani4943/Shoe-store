const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {  // Check if the 'username' cookie is present
        return next();  // If the user is authenticated, proceed to the next middleware/route handler
    } else {
        res.redirect('/users/login');  // If not authenticated, redirect to the login page
    }
}

// Route that handles the GET request for /register
router.get('/register', (req, res) => {
    res.render('register');  // This will render `register.ejs` from the `views` folder
});

// Route that handles the GET request for /login
router.get('/login', (req, res) => {
    res.render('login');  // This will render `login.ejs` from the `views` folder
});

// Route to handle user registration
router.post('/register', userController.register);

// Route to handle user login
router.post('/login', userController.login);

// Route to handle user logout
router.get('/logout', userController.logout);

// Protected routes
router.get('/store', isAuthenticated, (req, res) => {
    res.render('store');  // This will render `store.ejs` from the `views` folder
});

router.get('/cart', isAuthenticated, (req, res) => {
    res.render('cart');  // This will render `cart.ejs` from the `views` folder
});

router.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin');  // This will render `admin.ejs` from the `views` folder
});

module.exports = router;
