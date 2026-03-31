const express = require('express');
const axios = require('axios');
const router = express.Router();

// Fetch news from NewsAPI
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'jobs OR recruitment OR hiring OR careers',
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 10,
        apiKey: process.env.NEWS_API_KEY || 'demo'
      }
    });

    const news = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      link: article.url,
      image: article.urlToImage,
      source: article.source.name,
      publishedAt: article.publishedAt
    }));

    res.json({ success: true, news });
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch news',
      news: [] 
    });
  }
});

module.exports = router;