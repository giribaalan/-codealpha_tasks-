const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Free Google Translate API endpoint (no API key required)
async function translateText(text, sourceLang, targetLang) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await axios.get(url);
        
        // Parse the response
        let translatedText = '';
        for (const part of response.data[0]) {
            if (part[0]) {
                translatedText += part[0];
            }
        }
        
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        throw new Error('Translation failed');
    }
}

// Translation endpoint
app.post('/translate', async (req, res) => {
    try {
        const { text, sourceLang, targetLang } = req.body;
        
        if (!text || !targetLang) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const translated = await translateText(text, sourceLang, targetLang);
        
        res.json({
            original: text,
            translated: translated,
            sourceLang: sourceLang,
            targetLang: targetLang
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});