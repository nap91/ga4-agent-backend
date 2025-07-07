import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

app.post('/generate-ga4', async (req, res) => {
  const { prompt, html, title, url } = req.body;

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
  const reply = data.choices?.[0]?.message?.content || 'Error generating GA4 object.';
  res.json({ ga4: reply });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port 3000');
});
