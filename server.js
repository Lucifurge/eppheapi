const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Get your RapidAPI key from environment variables (Ensure to keep your key secure)
const apiKey = 'f7674b64c5mshb47ed2939d86c50p1d1d12jsn051c3194499f'; // Replace with your RapidAPI key
const apiHost = 'privatix-temp-mail-v1.p.rapidapi.com';

// Enable CORS for the specific frontend URL
const allowedOrigin = 'https://ephemail.onrender.com'; // Allow frontend from this URL

// Middleware to enable CORS for specific origin
app.use(cors({
  origin: allowedOrigin, // Only allow requests from this origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Helper function to make the request to the Privatix Temp Mail API
const makeRequest = async (method, path) => {
  const url = `https://${apiHost}${path}`;
  
  try {
    const response = await axios({
      method: method,
      url: url,
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Endpoint to create temporary email
app.get('/api/create-email', async (req, res) => {
  try {
    const data = await makeRequest('GET', '/request/mail/id/');
    res.json(data); // Return the temporary email created
  } catch (error) {
    res.status(500).json({ message: 'Error creating temporary email', error: error.message });
  }
});

// Endpoint to fetch an email by ID
app.get('/api/email/:mail_id', async (req, res) => {
  const { mail_id } = req.params;
  try {
    const data = await makeRequest('GET', `/request/one_mail/id/${mail_id}/`);
    res.json(data); // Return the fetched email details
  } catch (error) {
    res.status(500).json({ message: 'Error fetching email', error: error.message });
  }
});

// Endpoint to delete an email by ID
app.get('/api/delete-email/:mail_id', async (req, res) => {
  const { mail_id } = req.params;
  try {
    const data = await makeRequest('GET', `/request/delete/id/${mail_id}/`);
    res.json(data); // Return the response after deleting the email
  } catch (error) {
    res.status(500).json({ message: 'Error deleting email', error: error.message });
  }
});

// Endpoint to fetch attachments from a specific email
app.get('/api/attachments/:mail_id', async (req, res) => {
  const { mail_id } = req.params;
  try {
    const data = await makeRequest('GET', `/request/attachments/id/${mail_id}/`);
    res.json(data); // Return the email attachments
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attachments', error: error.message });
  }
});

// Endpoint to fetch one attachment by ID
app.get('/api/attachment/:mail_id/:attachment_id', async (req, res) => {
  const { mail_id, attachment_id } = req.params;
  try {
    const data = await makeRequest('GET', `/request/one_attachment/id/${mail_id}/${attachment_id}/`);
    res.json(data); // Return the specific attachment
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attachment', error: error.message });
  }
});

// Endpoint to fetch emails (list)
app.get('/api/emails', async (req, res) => {
  try {
    const data = await makeRequest('GET', '/request/mail/id/null/');
    res.json(data); // Return the list of emails
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emails', error: error.message });
  }
});

// Endpoint to fetch available domains
app.get('/api/domains', async (req, res) => {
  try {
    const data = await makeRequest('GET', '/request/domains/');
    res.json(data); // Return the list of domains
  } catch (error) {
    res.status(500).json({ message: 'Error fetching domains', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
