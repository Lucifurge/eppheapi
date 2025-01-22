const axios = require('axios');
const { faker } = require('@faker-js/faker');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to handle CORS and parse JSON body
app.use(cors());
app.use(express.json());

// Fetch available domains from Mail.tm
async function getDomains() {
    try {
        const response = await axios.get('https://api.mail.tm/domains');
        return response.data['hydra:member'];
    } catch (error) {
        console.error('Error fetching domains:', error.message);
        return [];  // Return an empty array in case of error
    }
}

// Generate a random username and password
function generateRandomCredentials(domain) {
    const username = faker.internet.userName(); // Generate a random username
    const password = faker.internet.password(); // Generate a random password
    return { username, password };
}

// Create an account using a random username
async function createAccount(domain) {
    try {
        const { username, password } = generateRandomCredentials(domain);
        const address = `${username}@${domain}`;

        // Send request to Mail.tm API to create the account
        const response = await axios.post('https://api.mail.tm/accounts', {
            address,
            password,
        });

        console.log('Account Created:', response.data);

        // Return account details along with the address and password
        return { address, password, data: response.data };
    } catch (error) {
        console.error('Error creating account:', error.message);
        return null;  // Return null in case of error
    }
}

// Authenticate the created account to get a token
async function authenticate(address, password) {
    try {
        console.log(`Attempting to authenticate with address: ${address} and password: ${password}`);

        // Send request to Mail.tm API to authenticate the user
        const response = await axios.post('https://api.mail.tm/token', {
            address,
            password,
        });

        console.log('Authentication Response:', response.data);

        // Check if the authentication was successful and a token is returned
        if (response.data.token) {
            console.log('Authentication successful, token:', response.data.token);
            return response.data.token;  // Return token
        } else {
            console.error('No token received');
            return null;  // Return null if token is not received
        }
    } catch (error) {
        console.error('Error authenticating:', error.message);
        return null;  // Return null in case of error
    }
}

// Fetch messages from the created account
async function fetchMessages(token) {
    try {
        const response = await axios.get('https://api.mail.tm/messages', {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Messages fetched:', response.data);

        // Return the list of messages
        return response.data['hydra:member'];
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        return [];  // Return an empty array in case of error
    }
}

// API Endpoint to create an account
app.post('/create-account', async (req, res) => {
    const domains = await getDomains();
    if (domains.length === 0) {
        return res.status(400).json({ message: 'No domains available to create an account' });
    }

    const domain = domains[0].domain;
    const accountDetails = await createAccount(domain);

    if (accountDetails) {
        return res.status(200).json(accountDetails);
    } else {
        return res.status(500).json({ message: 'Error creating account' });
    }
});

// API Endpoint to authenticate the account and get a token
app.post('/authenticate', async (req, res) => {
    const { address, password } = req.body;

    if (!address || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const token = await authenticate(address, password);

    if (token) {
        return res.status(200).json({ token });
    } else {
        return res.status(401).json({ message: 'Authentication failed' });
    }
});

// API Endpoint to fetch messages using the token
app.post('/fetch-messages', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required to fetch messages' });
    }

    const messages = await fetchMessages(token);

    if (messages) {
        return res.status(200).json({ messages });
    } else {
        return res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
