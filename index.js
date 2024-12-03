const axios = require('axios');
const cheerio = require('cheerio');

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  let { linktreeUrl } = req.body;

  // Validate the URL
  if (!linktreeUrl) {
    return res.status(400).json({ error: 'Missing linktreeUrl in request body' });
  }

  // Add https:// if not present
  if (!linktreeUrl.startsWith('http://') && !linktreeUrl.startsWith('https://')) {
    linktreeUrl = `https://${linktreeUrl}`;
  }

  try {
    // Add headers to mimic a real browser
    const { data } = await axios.get(linktreeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const $ = cheerio.load(data);
    const links = [];

    // Extract links and titles from <a> elements
    $('a').each((_, element) => {
      const link = $(element).attr('href');
      const title = $(element).text().trim();
      if (link) {
        links.push({ title, url: link });
      }
    });

    // Return the scraped links in a JSON response
    return res.status(200).json({ links });
  } catch (error) {
    console.error('Error scraping Linktree URL:', error.message);
    return res.status(500).json({ error: 'Failed to scrape Linktree URL' });
  }
};
