import supertest from 'supertest';
import express from 'express';
import cors from 'cors';

// Initialize Express app for testing
const app = express();

// Use the same middleware configuration as your main server
app.use(cors({
    origin: 'https://ephemail.onrender.com', // Allow this domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Dummy data for testing
let account = null;

// Create Account Route
app.post('/create-account', (req, res) => {
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

// Test the API
describe('API Tests', () => {
    it('should create an account', async () => {
        const res = await supertest(app).post('/create-account');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toHaveProperty('username', 'randomemail@example.com');
    });

    it('should get account data', async () => {
        const res = await supertest(app).get('/me');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toHaveProperty('username');
    });

    it('should get messages', async () => {
        const res = await supertest(app).get('/messages');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.messages).toBeInstanceOf(Array);
    });

    it('should delete the account', async () => {
        const res = await supertest(app).delete('/delete-account');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toBe('Account deleted successfully.');
    });
});

// Start the test server (optional, just in case you want to run the server during tests)
app.listen(4000, () => {
    console.log('Test server is running on http://localhost:4000');
});
