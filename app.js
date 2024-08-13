

//import the necessary modules
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); //parse cookies
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Set up views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  // You can use any templating engine, here we're using EJS

// Routes
app.use('/users', userRoutes);

// Example route (you'll create more later)
app.get('/', (req, res) => {
    res.redirect('/users/login');
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
