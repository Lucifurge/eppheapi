// Import necessary modules
import express from 'express';
import cors from 'cors';

// Initialize the Express app
const app = express();

// Middleware for handling CORS - Allow requests from your frontend domain
app.use(cors({
    origin: 'https://ephemail.onrender.com', // Allow this domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware for parsing JSON bodies
app.use(express.json());

// Dummy data for testing (replace with actual logic)
let account = null;

// Create Account Route
app.post('/create-account', (req, res) => {
    // Simulate account creation and return a random email address
    account = { username: 'randomemail@example.com' };
    res.json({ status: true, data: account });
});

// Get Account Data Route
app.get('/me', (req, res) => {
    if (account) {
        res.json({ status: true, data: account });
    } else {
        res.status(404).json({ status: false, message: 'Account not found.' });
    }
});

// Get Messages Route (Dummy)
app.get('/messages', (req, res) => {
    if (account) {
        res.json({ status: true, messages: ['Test Message 1', 'Test Message 2'] });
    } else {
        res.status(404).json({ status: false, message: 'No messages available.' });
    }
});

// Delete Account Route
app.delete('/delete-account', (req, res) => {
    account = null;
    res.json({ status: true, message: 'Account deleted successfully.' });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
