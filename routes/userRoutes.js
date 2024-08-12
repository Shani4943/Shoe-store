

const express = require('express');
const fs = require('fs');
const path = require('path');
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

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.cookies.username === 'admin') {  // Check if the logged-in user is 'admin'
        return next();  // If the user is an admin, proceed
    } else {
        res.status(403).send('Access denied.');  // If not, deny access
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
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));
    res.render('store', { products, username: req.cookies.username });
});


router.get('/cart', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    res.render('cart', { cart: cart[username] || [] });
});


router.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    const activityLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/activityLog.json')));
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));
    res.render('admin', { activityLog, products });  // Pass both `activityLog` and `products` to the template
});

// add to cart rout

router.post('/store/add-to-cart', isAuthenticated, (req, res) => {
    console.log('Add to Cart route hit');
    console.log('Request body:', req.body); // Log the request body
    
    const { title } = req.body;
    const username = req.cookies.username;

    const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));
    const product = products.find(p => p.title === title);

    if (!product) {
        console.log('Product not found:', title); // Log the error
        return res.status(400).json({ success: false, message: 'Product not found.' });
    }

    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    if (!cart[username]) {
        cart[username] = [];
    }

    cart[username].push(product);

    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    console.log('Product added to cart:', product); // Log success
    res.json({ success: true });
});

router.post('/store/remove-from-cart', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    // Load the current cart
    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    if (!cart[username]) {
        return res.status(400).json({ success: false, message: 'Cart not found.' });
    }

    // Remove the item from the user's cart
    cart[username] = cart[username].filter(item => item.title !== title);

    // Save the updated cart back to the file
    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    // Redirect back to the cart page
    res.redirect('/users/cart');
});



module.exports = router;
