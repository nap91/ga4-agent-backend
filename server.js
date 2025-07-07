import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors()); // Allow all origins for testing
app.use(express.json({ limit: '2mb' })); // Increase payload limit just in case

app.post('/generate-ga4', async (req, res) => {
  const { prompt, html, title, url } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a GA4 expert who creates structured dataLayer.push() objects from page content.' },
          { role: 'user', content: `Page title: ${title}\nURL: ${url}\nHTML: ${html.slice(0, 4000)}\nPrompt: ${prompt}` }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (data?.choices?.[0]?.message?.content) {
      res.json({ ga4: data.choices[0].message.content });
    } else {
      console.error("OpenAI API error or malformed response:", data);
      res.json({ ga4: 'Error generating GA4 object.', debug: data });
    }
  } catch (error) {
    console.error("🔥 Server error during OpenAI call:", error);
    res.status(500).json({ ga4: 'Internal Server Error', error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port 3000');
});
