const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const { verifyToken, requireAuth } = require('../controllers/authController');

// Middleware to check token on all routes (populates req.user if valid)
router.use(verifyToken);

// Routes
router.post('/link', linkController.createLink);
router.get('/link/:slug', linkController.checkLink);
router.post('/link/:slug/unlock', linkController.unlockLink);

// 👇 NEW: Add the Google Unlock route here
router.post('/link/:slug/unlock-google', linkController.unlockWithGoogle);
router.post('/link/scan', linkController.scanUrl);

router.delete('/link/:slug', requireAuth, linkController.deleteLink);
router.get('/dashboard', requireAuth, linkController.getUserLinks);

module.exports = router;