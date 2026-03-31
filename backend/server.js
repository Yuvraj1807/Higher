const express = require('express');
const cors = require('cors');
require('dotenv').config();

const resumeRoutes = require('./routes/resume');
const newsRoutes = require('./routes/news');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/news', newsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});