const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// Allow requests only from your website
app.use(cors({
    origin: 'https://connectgold.sbs'
}));

// Route for testing
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Route to fetch LevelPlay stats
app.get('/levelplay', async (req, res) => {
    const API_KEY = 'f1e0e319f6da';
    const APP_KEY = '1ea2bbf25';
    
    try {
        const response = await axios.get(`https://platform.ironsrc.com/partners/publisher/${APP_KEY}/stats`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('LevelPlay API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
