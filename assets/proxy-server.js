const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Proxy cho tenant_access_token
app.get('/token', async (req, res) => {
  try {
    const callbackName = req.query.callback;
    const response = await fetch('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "app_id": "cli_a5fc5d59ccbb900a",
        "app_secret": "KKlS3dXXugYYfTrCRhRzFeFchC8fHGjW"
      })
    });
    
    const data = await response.json();
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`${callbackName}(${JSON.stringify(data)})`);
  } catch (error) {
    res.status(500).send(`${req.query.callback}({error: "Server error"})`);
  }
});

// Proxy cho Bitable API
app.get('/bitable', async (req, res) => {
  try {
    const { token, url } = req.query;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 