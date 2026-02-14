const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/markets');
const analyticsRoutes = require('./routes/analytics');
const utilityRoutes = require('./routes/utility');
const socialRoutes = require('./routes/social');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Blade Dance API', version: '1.0.0' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/utility', utilityRoutes);
app.use('/api/social', socialRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Blade Dance API is running on port ${PORT}`);
});