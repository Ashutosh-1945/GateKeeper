const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const runReaper = require('./utils/reaper');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Start Reaper (Cron Job)
runReaper();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
