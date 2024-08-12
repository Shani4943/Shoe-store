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
    const { username, password } = req.body; // Extract username and password from the request body
    const users = readUsers(); // Read the current users from the users.json file

    if (!users[username] || users[username].password !== password) { // Check if the username exists and the password matches
        return res.status(400).send('Invalid username or password.'); // If not, send an error response
    }

    // Set a cookie for the session
    res.cookie('username', username, {
        maxAge: req.body.rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000 // 10 days or 30 minutes depending on 'remember me'
    });

    res.status(200).send('Login successful.'); // Send a success response
};

// Logout a user
exports.logout = (req, res) => {
    res.clearCookie('username'); // Clear the session cookie
    res.status(200).send('Logged out successfully.'); // Send a success response
};
