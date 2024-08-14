

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

    // Check if the product is already in the cart
    const existingItem = cart[username].find(item => item.title === title);

    if (existingItem) {
        // If the product is already in the cart, increase its quantity
        existingItem.quantity += 1;
    } else {
        // Otherwise, add the product to the cart with a quantity of 1
        cart[username].push({ ...product, quantity: 1 });
    }

    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    console.log('Product added to cart:', product); // Log success
    res.json({ success: true });
});

//quantity of an item in cart
router.post('/store/increase-quantity', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    const item = cart[username].find(item => item.title === title);
    if (item) {
        item.quantity += 1;
        fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));
    }

    res.redirect('/users/cart');
});


router.post('/store/decrease-quantity', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    const item = cart[username].find(item => item.title === title);
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            // If quantity reaches 0, remove the item from the cart
            cart[username] = cart[username].filter(item => item.title !== title);
        }
        fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));
    }

    res.redirect('/users/cart');
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

router.get('/checkout', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    let totalPrice = 0;

    if (cart[username]) {
        cart[username].forEach(item => {
            totalPrice += item.price * item.quantity; // Calculate the total price based on quantity
        });
    }

    res.render('checkout', { cart: cart[username] || [], totalPrice });
});


// Route to handle completing the purchase
router.post('/checkout/complete', isAuthenticated, (req, res) => {
    const username = req.cookies.username;

    // Load the current cart
    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    // Clear the user's cart after purchase
    cart[username] = [];

    // Save the updated cart back to the file
    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    // Redirect to the Thank You page
    res.redirect('/users/thankyou');
});

// Add a route to render the Thank You page
router.get('/thankyou', isAuthenticated, (req, res) => {
    res.render('thankyou');
});

router.get('/wishlist', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const wishlist = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/wishlist.json')));

    const userWishlist = wishlist[username] || [];

    res.render('wishlist', { wishlist: userWishlist });
});

router.post('/wishlist/add', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    // Load the existing wishlist or create an empty one if it doesn't exist
    const wishlist = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/wishlist.json')));

    if (!wishlist[username]) {
        wishlist[username] = [];
    }

    // Check if the item is already in the wishlist
    const existingItem = wishlist[username].find(item => item.title === title);

    if (existingItem) {
        return res.status(400).json({ success: false, message: 'Item is already in the wishlist.' });
    }

    // Load the products to find the one to add to the wishlist
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));
    const product = products.find(p => p.title === title);

    if (!product) {
        return res.status(400).json({ success: false, message: 'Product not found.' });
    }

    // Add the product to the user's wishlist
    wishlist[username].push(product);

    // Save the updated wishlist back to the file
    fs.writeFileSync(path.join(__dirname, '../data/wishlist.json'), JSON.stringify(wishlist, null, 2));

    res.json({ success: true });
});

router.post('/wishlist/remove', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    // Load the current wishlist
    const wishlist = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/wishlist.json')));

    if (!wishlist[username]) {
        return res.status(400).json({ success: false, message: 'Wishlist not found.' });
    }

    // Remove the item from the user's wishlist
    wishlist[username] = wishlist[username].filter(item => item.title !== title);

    // Save the updated wishlist back to the file
    fs.writeFileSync(path.join(__dirname, '../data/wishlist.json'), JSON.stringify(wishlist, null, 2));

    // Respond with success
    res.json({ success: true });
});






module.exports = router;
