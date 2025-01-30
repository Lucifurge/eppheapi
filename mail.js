onst axios = require('axios');
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

async function getDomains() {
    try {
        const response = await axios.get('https://api.mail.tm/domains', { headers: HEADERS });
        return response.data['hydra:member'].map(domain => domain.domain);
    } catch (error) {
        console.error('Error fetching domains:', error.message);
        return [];
    }
}

function generateRandomCredentials(domain) {
    const username = faker.internet.userName().toLowerCase().replace(/[^a-z0-9]/g, '');
    return {
        email: `${username}@${domain}`,
        password: faker.internet.password()
    };
}

async function createAccount(domain) {
    try {
        const { email, password } = generateRandomCredentials(domain);
        const response = await axios.post('https://api.mail.tm/accounts', { address: email, password }, { headers: HEADERS });
        if (response.status === 201) {
            return { email, password, id: response.data.id };
        }
    } catch (error) {
        console.error('Error creating account:', error.response?.data || error.message);
    }
    return null;
}

async function authenticate(email, password) {
    try {
        const response = await axios.post('https://api.mail.tm/token', { address: email, password }, { headers: HEADERS });
        return response.data.token || null;
    } catch (error) {
        console.error('Error authenticating:', error.response?.data || error.message);
        return null;
    }
}

async function fetchMessages(token) {
    try {
        const response = await axios.get('https://api.mail.tm/messages', {
            headers: { Authorization: `Bearer ${token}`, ...HEADERS }
        });
        return response.data['hydra:member'];
    } catch (error) {
        console.error('Error fetching messages:', error.response?.data || error.message);
        return [];
    }
}

app.get('/domains', async (req, res) => {
    const domains = await getDomains();
    return domains.length > 0 ? res.status(200).json({ domains }) : res.status(500).json({ message: 'Failed to fetch domains' });
});

app.post('/create-account', async (req, res) => {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ message: 'Domain is required' });
    const account = await createAccount(domain);
    return account ? res.status(200).json(account) : res.status(500).json({ message: 'Error creating account' });
});

app.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const token = await authenticate(email, password);
    return token ? res.status(200).json({ token }) : res.status(401).json({ message: 'Authentication failed' });
});

app.get('/fetch-messages', async (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(400).json({ message: 'Token is required' });
    const messages = await fetchMessages(token.replace("Bearer ", ""));
    return res.status(200).json({ messages });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
