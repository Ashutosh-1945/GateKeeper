const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Log a system event to Firestore.
 * @param {string} action - e.g., 'LINK_CREATED', 'AI_SCAN', 'LOGIN'
 * @param {object} user - The req.user object (or null for Guest)
 * @param {string} targetId - The ID of the item affected (e.g., slug)
 * @param {string} details - Human-readable description
 * @param {object} req - Express request object (to capture IP/UserAgent)
 */
const logEvent = async (action, user, targetId, details, req = null) => {
  try {
    const logEntry = {
      action,
      performedBy: user ? user.uid : 'Guest',
      performerEmail: user ? user.email : 'Anonymous',
      targetId: targetId || null,
      details,
      // Capture Technical Metadata
      metadata: req ? {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        method: req.method,
        url: req.originalUrl
      } : {},
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // "Fire and Forget" - Don't await this, let it run in background
    db.collection('system_logs').add(logEntry).catch(err => console.error("Log failed:", err));
    
    // Optional: Print to console for dev debugging
    console.log(`📝 [${action}] ${details}`);

  } catch (error) {
    console.error("Logger Error:", error);
  }
};

module.exports = logEvent;