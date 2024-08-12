
//In a Node.js application, the controllers directory is typically used to store 
//the logic that handles requests and generates responses. 


const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper function to read user data
function readUsers() {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
}

// Helper function to write user data
function writeUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Register a new user
exports.register = (req, res) => {
    const { username, password } = req.body; // Extract username and password from the request body
    const users = readUsers(); // Read the current users from the users.json file

    if (users[username]) { // Check if the username already exists
        return res.status(400).send('User already exists.'); // If it does, send an error response
    }

    users[username] = { username, password }; // Add the new user to the users object
    writeUsers(users); // Write the updated users object back to users.json

    res.status(201).send('User registered successfully.'); // Send a success response
};

// Login a user
exports.login = (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    if (!users[username] || users[username].password !== password) {
        return res.status(400).send('Invalid username or password.');
    }

    // Log login activity
    logActivity(username, 'login');

    res.cookie('username', username, {
        maxAge: req.body.rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000
    });

    // Redirect to the store page after successful login
    res.redirect('/users/store');
};


// Middleware to check if the user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.cookies.username) {  // Check if the 'username' cookie is present
        return next();  // If the user is authenticated, proceed to the next middleware/route handler
    } else {
        res.redirect('/users/login');  // If not authenticated, redirect to the login page
    }
};


// Logout a user
exports.logout = (req, res) => {
    // Log logout activity
    logActivity(req.cookies.username, 'logout');

    res.clearCookie('username');
    res.redirect('/users/login');
};


const activityLogPath = path.join(__dirname, '../data/activityLog.json');

// Helper function to log activities
function logActivity(username, activityType) {
    const activityLog = JSON.parse(fs.readFileSync(activityLogPath));
    const newLog = {
        datetime: new Date().toISOString(),
        username,
        type: activityType
    };
    activityLog.push(newLog);
    fs.writeFileSync(activityLogPath, JSON.stringify(activityLog, null, 2));
}
