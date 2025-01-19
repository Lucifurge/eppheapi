const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Get your RapidAPI key from environment variables
const apiKey = process.env.RAPIDAPI_KEY; // Securely get the API key
const apiHost = 'privatix-temp-mail-v1.p.rapidapi.com';

// Enable CORS for the specific frontend URL
const allowedOrigin = 'https://ephemail.onrender.com';

// Middleware to enable CORS for specific origin
app.use(cors({
  origin: allowedOrigin, // Only allow requests from this origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Endpoint to create temporary email
app.get('/api/create-email', async (req, res) => {
  try {
    const response = await axios.get('https://privatix-temp-mail-v1.p.rapidapi.com/request/mail/id/', {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
    });
    res.json(response.data); // Return the temporary email created
  } catch (error) {
    res.status(500).send('Error creating temporary email: ' + error.message);
  }
});

// Endpoint to fetch email by ID
app.get('/api/email/:mail_id', async (req, res) => {
  const { mail_id } = req.params;
  try {
    const response = await axios.get(`https://privatix-temp-mail-v1.p.rapidapi.com/request/one_mail/id/${mail_id}/`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
    });
    res.json(response.data); // Return the fetched email details
  } catch (error) {
    res.status(500).send('Error fetching email: ' + error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
