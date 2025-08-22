const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));
app.use(express.raw({ type: 'application/octet-stream' }));

// IGDB API proxy endpoints
app.post('/api/igdb/games', async (req, res) => {
  try {
    const body = req.body;
    
    console.log('Proxying request to IGDB: games');
    console.log('Request body type:', typeof body);
    console.log('Request body:', body);
    console.log('Request headers:', req.headers);
    
    // Get access token from Twitch
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_IGDB_CLIENT_ID,
        client_secret: process.env.VITE_IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Twitch OAuth error:', errorText);
      return res.status(500).json({ error: 'Failed to get access token' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Make request to IGDB
    const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.VITE_IGDB_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      console.error('IGDB API error:', errorText);
      return res.status(igdbResponse.status).json({ 
        error: `IGDB API error: ${igdbResponse.status}`,
        details: errorText 
      });
    }

    const data = await igdbResponse.json();
    console.log(`IGDB response: ${data.length} items`);
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/igdb/genres', async (req, res) => {
  try {
    const body = req.body;
    
    console.log('Proxying request to IGDB: genres');
    console.log('Request body type:', typeof body);
    console.log('Request body:', body);
    
    // Get access token from Twitch
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_IGDB_CLIENT_ID,
        client_secret: process.env.VITE_IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Twitch OAuth error:', errorText);
      return res.status(500).json({ error: 'Failed to get access token' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Make request to IGDB
    const igdbResponse = await fetch('https://api.igdb.com/v4/genres', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.VITE_IGDB_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      console.error('IGDB API error:', errorText);
      return res.status(igdbResponse.status).json({ 
        error: `IGDB API error: ${igdbResponse.status}`,
        details: errorText 
      });
    }

    const data = await igdbResponse.json();
    console.log(`IGDB response: ${data.length} items`);
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/igdb/platforms', async (req, res) => {
  try {
    const body = req.body;
    
    console.log('Proxying request to IGDB: platforms');
    console.log('Request body type:', typeof body);
    console.log('Request body:', body);
    
    // Get access token from Twitch
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_IGDB_CLIENT_ID,
        client_secret: process.env.VITE_IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Twitch OAuth error:', errorText);
      return res.status(500).json({ error: 'Failed to get access token' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Make request to IGDB
    const igdbResponse = await fetch('https://api.igdb.com/v4/platforms', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.VITE_IGDB_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      console.error('IGDB API error:', errorText);
      return res.status(igdbResponse.status).json({ 
        error: `IGDB API error: ${igdbResponse.status}`,
        details: errorText 
      });
    }

    const data = await igdbResponse.json();
    console.log(`IGDB response: ${data.length} items`);
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'IGDB Proxy Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 IGDB Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to IGDB API`);
  console.log(`🔑 Using Client ID: ${process.env.VITE_IGDB_CLIENT_ID}`);
  console.log(`🔐 Client Secret: ${process.env.VITE_IGDB_CLIENT_SECRET ? '***' + process.env.VITE_IGDB_CLIENT_SECRET.slice(-4) : 'NOT FOUND'}`);
});
