const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Manual scraper
const scrapeLinktree = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const links = [];

    $('a').each((_, element) => {
      const link = $(element).attr('href');
      const title = $(element).text().trim();
      if (link) {
        links.push({ title, url: link });
      }
    });

    return links;
  } catch (error) {
    console.error('Error fetching Linktree URL:', error.message);
    throw new Error('Failed to scrape the URL');
  }
};

// API endpoint to scrape Linktree URLs
app.post('/scrape', async (req, res) => {
  const { linktreeUrl } = req.body;

  if (!linktreeUrl) {
    return res.status(400).json({ error: 'Missing linktreeUrl in request body' });
  }

  try {
    const result = await scrapeLinktree(linktreeUrl);
    return res.json({ links: result });
  } catch (error) {
    console.error('Error scraping Linktree URL:', error.message);
    return res.status(500).json({ error: 'Failed to scrape Linktree URL' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Scraper API is running on port ${PORT}`);
});
