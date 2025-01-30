const axios = require('axios');
const { faker } = require('@faker-js/faker');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

// Function to fetch available domains from mail.tm API
async function getDomains() {
    try {
        const response = await axios.get('https://api.mail.tm/domains', { headers: HEADERS });
        return response.data['hydra:member'].map(domain => domain.domain);
    } catch (error) {
        console.error('Error fetching domains:', error.message);
        return [];
    }
}

// Generate random email credentials using a provided domain
function generateRandomCredentials(domain) {
    const username = faker.internet.userName().toLowerCase().replace(/[^a-z0-9]/g, '');
    return {
        email: `${username}@${domain}`,
        password: faker.internet.password()
    };
}

// Function to create an email account
async function createAccount(domain) {
    try {
        const { email, password } = generateRandomCredentials(domain);
        const response = await axios.post('https://api.mail.tm/accounts', { address: email, password }, { headers: HEADERS });

        return { email, password, data: response.data };
    } catch (error) {
        console.error('Error creating account:', error.message);
        return null;
    }
}

// Function to authenticate and get a token
async function authenticate(email, password) {
    try {
        const response = await axios.post('https://api.mail.tm/token', { address: email, password }, { headers: HEADERS });

        if (response.data.token) {
            return response.data.token;
        } else {
            console.error('No token received');
            return null;
        }
    } catch (error) {
        console.error('Error authenticating:', error.message);
        return null;
    }
}

// Function to fetch messages
async function fetchMessages(token) {
    try {
        const response = await axios.get('https://api.mail.tm/messages', { headers: { Authorization: `Bearer ${token}`, ...HEADERS } });
        return response.data['hydra:member'];
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        return [];
    }
}

// API Endpoint to get available domains
app.get('/domains', async (req, res) => {
    const domains = await getDomains();
    
    if (domains.length > 0) {
        return res.status(200).json({ domains });
    } else {
        return res.status(500).json({ message: 'Failed to fetch domains' });
    }
});

// API Endpoint to create an account
app.post('/create-account', async (req, res) => {
    const { domain } = req.body;

    if (!domain) {
        return res.status(400).json({ message: 'Domain is required' });
    }

    const account = await createAccount(domain);
    
    if (account) {
        return res.status(200).json(account);
    } else {
        return res.status(500).json({ message: 'Error creating account' });
    }
});

// API Endpoint to authenticate and get token
app.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    const token = await authenticate(email, password);

    if (token) {
        return res.status(200).json({ token });
    } else {
        return res.status(401).json({ message: 'Authentication failed' });
    }
});

// API Endpoint to fetch messages
app.post('/fetch-messages', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    const messages = await fetchMessages(token);

    return res.status(200).json({ messages });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
