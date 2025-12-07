const { db } = require('../config/firebase');

const runReaper = () => {
  setInterval(async () => {
    try {
      const now = new Date().toISOString();
      
      // Query for expired links
      const snapshot = await db.collection('links')
        .where('security.expiresAt', '<', now)
        .get();

      if (snapshot.empty) return;

      const batch = db.batch();
      let count = 0;

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });

      await batch.commit();
      if (count > 0) {
        console.log(`[Reaper] Deleted ${count} expired links.`);
      }
    } catch (error) {
      console.error('[Reaper] Error:', error);
    }
  }, 60000); // Run every 60 seconds
};

module.exports = runReaper;
