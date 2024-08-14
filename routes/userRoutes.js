const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.cookies.username === 'admin') {
        return next();
    } else {
        res.status(403).send('Access denied.');
    }
}

// Route that handles the GET request for /register
router.get('/register', (req, res) => {
    res.render('register');
});

// Route that handles the GET request for /login
router.get('/login', (req, res) => {
    res.render('login');
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
    res.render('admin', { activityLog, products });
});

// Add to cart route
router.post('/store/add-to-cart', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));
    const product = products.find(p => p.title === title);

    if (!product) {
        return res.status(400).json({ success: false, message: 'Product not found.' });
    }

    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    if (!cart[username]) {
        cart[username] = [];
    }

    cart[username].push(product);

    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    res.json({ success: true });
});

// Remove from cart route
router.post('/store/remove-from-cart', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    if (!cart[username]) {
        return res.status(400).json({ success: false, message: 'Cart not found.' });
    }

    cart[username] = cart[username].filter(item => item.title !== title);

    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    res.redirect('/users/cart');
});

// Add to wishlist route
router.post('/wishlist/add', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const { title } = req.body;
    const wishlistFilePath = path.join(__dirname, '../data/wishlist.json');
    const wishlist = JSON.parse(fs.readFileSync(wishlistFilePath));

    if (!wishlist[username]) {
        wishlist[username] = [];
    }

    if (!wishlist[username].some(item => item.title === title)) {
        wishlist[username].push({ title });
        fs.writeFileSync(wishlistFilePath, JSON.stringify(wishlist, null, 2));
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Item already in wishlist' });
    }
});

// View wishlist route
router.get('/wishlist', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const wishlistFilePath = path.join(__dirname, '../data/wishlist.json');
    const wishlist = JSON.parse(fs.readFileSync(wishlistFilePath));
    const userWishlist = wishlist[username] || [];
    res.render('wishlist', { wishlist: userWishlist });
});

// Remove from wishlist route
router.post('/wishlist/remove', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const wishlistFilePath = path.join(__dirname, '../data/wishlist.json');
    const wishlist = JSON.parse(fs.readFileSync(wishlistFilePath));

    if (!wishlist[username]) {
        return res.status(400).json({ success: false, message: 'Wishlist not found.' });
    }

    wishlist[username] = wishlist[username].filter(item => item.title !== title);

    fs.writeFileSync(wishlistFilePath, JSON.stringify(wishlist, null, 2));

    res.json({ success: true });
});


// Route to display the gift card purchase page
router.get('/giftcard', isAuthenticated, (req, res) => {
    res.render('giftcard'); // Render the gift card form page
});

// Route to handle the form submission for purchasing a gift card
router.post('/giftcard/buy', isAuthenticated, (req, res) => {
    const { amount, message, sendAsGift, email } = req.body;
    const username = req.cookies.username;

    // Validate the input
    if (!amount || (sendAsGift === 'true' && !email)) {
        return res.status(400).send('Invalid input.');
    }

    // Simulate saving the gift card purchase (e.g., to a database or file)
    const giftCard = {
        amount,
        message,
        sendAsGift: sendAsGift === 'true',
        email: sendAsGift === 'true' ? email : null,
        purchasedBy: username,
        date: new Date()
    };

    // For demonstration purposes, log the gift card details to the console
    console.log('Gift Card Purchase:', giftCard);

    // Redirect to a confirmation page or the user's dashboard
    res.redirect('/users/giftcard/confirmation');
});

// Route to display the gift card purchase confirmation page
router.get('/giftcard/confirmation', isAuthenticated, (req, res) => {
    res.render('giftcardConfirmation'); // Render the confirmation page
});


// Route for the Terms and Conditions page
router.get('/terms', (req, res) => {
    res.render('terms');
});


// Route for the Contact Us page
router.get('/contact', (req, res) => {
    res.render('contact');
});

// Handle contact form submission
router.post('/contact', (req, res) => {
    const { name, email, orderNumber, reason, message } = req.body;

    // Process the form data here (e.g., save to a database, send an email)
    console.log('Contact Us Form Submitted:', { name, email, orderNumber, reason, message });

    // Redirect to a thank you page or show a success message
    res.redirect('/users/contact-success'); // Ensure this page exists or modify as needed
});

module.exports = router;