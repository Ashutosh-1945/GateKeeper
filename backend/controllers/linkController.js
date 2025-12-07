const { db } = require('../config/firebase');
const { nanoid } = require('nanoid');
const admin = require('firebase-admin');

// Create Link
exports.createLink = async (req, res) => {
  try {
    const { originalUrl, customSlug, password, expiresAt, maxClicks } = req.body;
    const ownerId = req.user ? req.user.uid : 'guest';

    console.log('Creating link for user:', ownerId, '| Authenticated:', !!req.user);

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    let slug = customSlug;

    if (slug) {
      // Case 1: Custom Slug
      const doc = await db.collection('links').doc(slug).get();
      if (doc.exists) {
        return res.status(409).json({ error: 'This alias is already taken' });
      }
    } else {
      // Case 2: Random Slug
      let isUnique = false;
      while (!isUnique) {
        slug = nanoid(6);
        const doc = await db.collection('links').doc(slug).get();
        if (!doc.exists) isUnique = true;
      }
    }

    const newLink = {
      _id: slug,
      originalUrl,
      ownerId,
      security: {
        password: password || null,
        expiresAt: expiresAt || null,
        maxClicks: maxClicks ? parseInt(maxClicks) : null
      },
      clickCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('links').doc(slug).set(newLink);

    res.status(201).json({ shortLink: `http://localhost:5173/${slug}`, slug });

  } catch (error) {
    console.error('Create Link Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Check Link (Gatekeeper)
exports.checkLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    // Check 1: Existence
    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found' });
    }

    const link = doc.data();
    const now = new Date().toISOString();

    // Check 2: Reaper Logic (Self-Destruct)
    const isExpired = link.security.expiresAt && link.security.expiresAt < now;
    const isBurned = link.security.maxClicks && link.clickCount >= link.security.maxClicks;

    if (isExpired || isBurned) {
      await docRef.delete();
      return res.status(410).json({ error: 'This link has self-destructed' });
    }

    // Check 3: Password
    if (link.security.password) {
      return res.json({ protected: true });
    }

    // Success
    await docRef.update({
      clickCount: admin.firestore.FieldValue.increment(1)
    });

    res.json({ originalUrl: link.originalUrl });

  } catch (error) {
    console.error('Check Link Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Unlock Link
exports.unlockLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const { password } = req.body;
    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found' });
    }

    const link = doc.data();

    if (link.security.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Increment Click Count
    await docRef.update({
      clickCount: admin.firestore.FieldValue.increment(1)
    });

    res.json({ originalUrl: link.originalUrl });

  } catch (error) {
    console.error('Unlock Link Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get User Links (Dashboard)
exports.getUserLinks = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Fetching links for user:', req.user.uid);

    // Simple query without orderBy to avoid composite index requirement
    const snapshot = await db.collection('links')
      .where('ownerId', '==', req.user.uid)
      .get();

    console.log('Found documents:', snapshot.size);

    const links = snapshot.docs.map(doc => {
      const data = doc.data();
      // Remove sensitive data
      const { security, ...rest } = data;
      const safeSecurity = { ...security };
      delete safeSecurity.password;
      
      return { ...rest, security: safeSecurity };
    });

    // Sort by createdAt client-side (newest first)
    links.sort((a, b) => {
      const dateA = a.createdAt?._seconds || 0;
      const dateB = b.createdAt?._seconds || 0;
      return dateB - dateA;
    });

    res.json(links);

  } catch (error) {
    console.error('Get User Links Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Delete Link
exports.deleteLink = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { slug } = req.params;
    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const link = doc.data();

    // Check ownership
    if (link.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this link' });
    }

    await docRef.delete();

    res.json({ success: true, message: 'Link destroyed' });

  } catch (error) {
    console.error('Delete Link Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
