const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const runReaper = require('./utils/reaper');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - uses env variable for allowed origins
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Body Parser
app.use(express.json());

// Health check endpoint (useful for deployment platforms)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', apiRoutes);

// Start Reaper (Cron Job)
runReaper();

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 GateKeeper API running on port ${PORT}`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
});

// ============================================
// OPTIONAL: Uncomment for production hardening
// ============================================
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// app.use(helmet());
// app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

