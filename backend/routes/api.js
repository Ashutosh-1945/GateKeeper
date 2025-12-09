const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const adminController = require('../controllers/adminController');
const { verifyToken, requireAuth } = require('../controllers/authController');

// Middleware to check token on all routes (populates req.user if valid)
router.use(verifyToken);

// ============ PUBLIC ROUTES ============
router.post('/link', linkController.createLink);
router.get('/link/:slug', linkController.checkLink);
router.post('/link/:slug/unlock', linkController.unlockLink);
router.post('/link/:slug/unlock-google', linkController.unlockWithGoogle);

// ============ AUTHENTICATED USER ROUTES ============
router.post('/link/scan', requireAuth, linkController.scanUrl);
router.delete('/link/:slug', requireAuth, linkController.deleteLink);
router.get('/dashboard', requireAuth, linkController.getUserLinks);

// ============ ADMIN ROUTES ============
router.get('/admin/users', requireAuth, adminController.requireAdmin, adminController.getAllUsers);
router.get('/admin/users/:uid/details', requireAuth, adminController.requireAdmin, adminController.getUserDetails);
router.get('/admin/links', requireAuth, adminController.requireAdmin, adminController.getAllLinks);
router.get('/admin/links/:slug/details', requireAuth, adminController.requireAdmin, adminController.getLinkDetails);
router.get('/admin/stats', requireAuth, adminController.requireAdmin, adminController.getAdminStats);
router.delete('/admin/users/:uid', requireAuth, adminController.requireAdmin, adminController.deleteUser);
router.delete('/admin/links/:slug', requireAuth, adminController.requireAdmin, adminController.adminDeleteLink);
router.put('/admin/links/:slug', requireAuth, adminController.requireAdmin, adminController.updateLink);
router.get('/admin/logs', requireAuth, adminController.requireAdmin, adminController.getSystemLogs);

module.exports = router;