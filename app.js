


const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  // You can use any templating engine, here we're using EJS

// Routes
// Example route (you'll create more later)
app.get('/', (req, res) => {
    res.send('Welcome to the Shoe Store!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
