const express = require('express');
const cors = require('cors');
// Use axios instead of node-fetch to avoid body corruption
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Add axios interceptors for debugging
axios.interceptors.request.use(request => {
  console.log('=== AXIOS REQUEST INTERCEPTOR ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', request.headers);
  console.log('Request data type:', typeof request.data);
  
  // Handle different data types safely
  if (request.data instanceof URLSearchParams) {
    console.log('Request data: URLSearchParams object');
    console.log('Request data stringified:', request.data.toString());
  } else if (typeof request.data === 'string') {
    console.log('Request data:', JSON.stringify(request.data));
    console.log('Request data length:', request.data.length);
    console.log('Request data bytes:', Buffer.from(request.data).toString('hex'));
    
    // Special debugging for IGDB requests
    if (request.url.includes('api.igdb.com')) {
      console.log('=== IGDB REQUEST DEBUG ===');
      console.log('Raw request data:', request.data);
      console.log('Request data as buffer:', Buffer.from(request.data));
      console.log('Request data buffer length:', Buffer.from(request.data).length);
    }
  } else if (request.data) {
    console.log('Request data:', JSON.stringify(request.data));
    console.log('Request data length:', request.data.length || 'undefined');
  } else {
    console.log('Request data: undefined/null');
  }
  
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('=== AXIOS RESPONSE INTERCEPTOR ===');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response;
  },
  error => {
    console.log('=== AXIOS ERROR INTERCEPTOR ===');
    console.log('Error response status:', error.response?.status);
    console.log('Error response data:', error.response?.data);
    return Promise.reject(error);
  }
);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
// Remove express.json() as it interferes with text parsing
app.use(express.text({ type: 'text/plain' }));
// Remove express.raw() as it's not needed

// IGDB API proxy endpoints
app.post('/api/igdb/games', async (req, res) => {
  try {
    const body = req.body;
    
    console.log('=== REQUEST RECEIVED ===');
    console.log('Proxying request to IGDB: games');
    console.log('Request body type:', typeof body);
    console.log('Request body:', JSON.stringify(body));
    console.log('Request body length:', body.length);
    console.log('Request headers:', req.headers);
    
    // Get access token from Twitch
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', 
      new URLSearchParams({
        client_id: process.env.VITE_IGDB_CLIENT_ID,
        client_secret: process.env.VITE_IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Ensure body is a string and log what we're sending
    const requestBody = typeof body === 'string' ? body : body.toString();
    console.log('=== BEFORE SENDING TO IGDB ===');
    console.log('Sending to IGDB - Body type:', typeof requestBody);
    console.log('Sending to IGDB - Body:', JSON.stringify(requestBody));
    console.log('Sending to IGDB - Body length:', requestBody.length);
    console.log('Sending to IGDB - Body bytes:', Buffer.from(requestBody).toString('hex'));

    // Create the axios config for debugging
    const axiosConfig = {
      method: 'POST',
      url: 'https://api.igdb.com/v4/games',
      headers: {
        'Client-ID': process.env.VITE_IGDB_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      data: requestBody,
    };
    
    console.log('=== AXIOS CONFIG ===');
    console.log('Axios config:', JSON.stringify(axiosConfig, null, 2));
    console.log('Axios data type:', typeof axiosConfig.data);
    console.log('Axios data length:', axiosConfig.data.length);
    console.log('Axios data bytes:', Buffer.from(axiosConfig.data).toString('hex'));

    // Make request to IGDB using axios
    const igdbResponse = await axios(axiosConfig);

    console.log(`=== IGDB RESPONSE ===`);
    console.log(`IGDB response: ${igdbResponse.data.length} items`);
    
    res.json(igdbResponse.data);
  } catch (error) {
    console.error('=== PROXY ERROR ===');
    console.error('Proxy error:', error);
    if (error.response) {
      console.error('IGDB API error:', error.response.data);
      console.error('IGDB API status:', error.response.status);
      console.error('IGDB API headers:', error.response.headers);
      
      // Additional debugging for getGameById failures
      if (error.response.data && error.response.data[0] && error.response.data[0].details) {
        console.error('=== GETGAMEBYID DEBUG ===');
        console.error('Error details:', error.response.data[0].details);
        console.error('What IGDB actually received:', error.response.data[0].details);
      }
      
      return res.status(error.response.status).json({ 
        error: `IGDB API error: ${error.response.status}`,
        details: error.response.data 
      });
    }
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
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', 
      new URLSearchParams({
        client_id: process.env.VITE_IGDB_CLIENT_ID,
        client_secret: process.env.VITE_IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Make request to IGDB
    const igdbResponse = await axios.post('https://api.igdb.com/v4/genres', body, {
      headers: {
        'Client-ID': process.env.VITE_IGDB_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`IGDB response: ${igdbResponse.data.length} items`);
    
    res.json(igdbResponse.data);
  } catch (error) {
    console.error('Proxy error:', error);
    if (error.response) {
      console.error('IGDB API error:', error.response.data);
      return res.status(error.response.status).json({ 
        error: `IGDB API error: ${error.response.status}`,
        details: error.response.data 
      });
    }
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
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', 
      new URLSearchParams({
        client_id: process.env.VITE_IGDB_CLIENT_ID,
        client_secret: process.env.VITE_IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Make request to IGDB
    const igdbResponse = await axios.post('https://api.igdb.com/v4/platforms', body, {
      headers: {
        'Client-ID': process.env.VITE_IGDB_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`IGDB response: ${igdbResponse.data.length} items`);
    
    res.json(igdbResponse.data);
  } catch (error) {
    console.error('Proxy error:', error);
    if (error.response) {
      console.error('IGDB API error:', error.response.data);
      return res.status(error.response.status).json({ 
        error: `IGDB API error: ${error.response.status}`,
        details: error.response.data 
      });
    }
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
