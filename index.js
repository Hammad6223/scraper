const axios = require('axios');
const cheerio = require('cheerio');

// Vercel function handler
module.exports = async (req, res) => {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Extract the Linktree URL from the request body
  const { linktreeUrl } = req.body;

  // Validate the URL
  if (!linktreeUrl) {
    return res.status(400).json({ error: 'Missing linktreeUrl in request body' });
  }

    // Add https:// if not present
    if (!linktreeUrl.startsWith('http://') && !linktreeUrl.startsWith('https://')) {
      linktreeUrl = `https://${linktreeUrl}`;
    }
  

  try {
    // Fetch the Linktree page HTML
    const { data } = await axios.get(linktreeUrl);
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
