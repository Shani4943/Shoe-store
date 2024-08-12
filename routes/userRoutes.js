

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to handle user registration
router.post('/register', userController.register);

// Route to handle user login
router.post('/login', userController.login);

// Route to handle user logout
router.post('/logout', userController.logout);

//route that handles the GET request for /register
router.get('/register', (req, res) => {
    res.render('register');  // This will render `register.ejs` from the `views` folder
});

router.get('/login', (req, res) => {
    res.render('login');  // This will render `login.ejs` from the `views` folder
});


module.exports = router;
