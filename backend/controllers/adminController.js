const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const logEvent = require('../utils/logger');

// Admin email list
const ADMIN_EMAILS = [
  'admin@gatekeeper.com',
  'ashutosh1945@gmail.com',
  'mujjawal774@gmail.com',
];

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get user's email from Firebase Auth
    const userRecord = await admin.auth().getUser(req.user.uid);
    
    if (!ADMIN_EMAILS.includes(userRecord.email)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    // Get all users from Firebase Auth
    const listUsersResult = await admin.auth().listUsers(1000);
    
    // Get link counts for each user
    const usersWithStats = await Promise.all(
      listUsersResult.users.map(async (userRecord) => {
        const linksSnapshot = await db.collection('links')
          .where('ownerId', '==', userRecord.uid)
          .get();
        
        return {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
          createdAt: userRecord.metadata.creationTime 
            ? { _seconds: Math.floor(new Date(userRecord.metadata.creationTime).getTime() / 1000) }
            : null,
          linksCount: linksSnapshot.size,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Get all links
const getAllLinks = async (req, res) => {
  try {
    const snapshot = await db.collection('links').get();
    
    // Get owner emails
    const links = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let ownerEmail = 'guest';
        
        if (data.ownerId && data.ownerId !== 'guest') {
          try {
            const userRecord = await admin.auth().getUser(data.ownerId);
            ownerEmail = userRecord.email;
          } catch (e) {
            ownerEmail = 'Unknown';
          }
        }
        
        return {
          _id: doc.id,
          originalUrl: data.originalUrl,
          ownerId: data.ownerId,
          ownerEmail,
          clickCount: data.clickCount || 0,
          createdAt: data.createdAt,
          security: {
            password: !!data.security?.password,
            expiresAt: data.security?.expiresAt,
            maxClicks: data.security?.maxClicks,
          },
        };
      })
    );

    res.json(links);
  } catch (error) {
    console.error('Get all links error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Get admin stats
const getAdminStats = async (req, res) => {
  try {
    // Get user count
    const listUsersResult = await admin.auth().listUsers(1000);
    const totalUsers = listUsersResult.users.length;

    // Get link stats
    const linksSnapshot = await db.collection('links').get();
    const totalLinks = linksSnapshot.size;
    
    let totalClicks = 0;
    let activeLinks = 0;
    const now = new Date();

    linksSnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalClicks += data.clickCount || 0;
      
      // Check if link is active
      const isExpired = data.security?.expiresAt && new Date(data.security.expiresAt) < now;
      const isBurned = data.security?.maxClicks && data.clickCount >= data.security.maxClicks;
      
      if (!isExpired && !isBurned) {
        activeLinks++;
      }
    });

    res.json({
      totalUsers,
      totalLinks,
      totalClicks,
      activeLinks,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Delete user (and their links)
const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;

    // Don't allow deleting yourself
    if (uid === req.user.uid) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user's links first
    const linksSnapshot = await db.collection('links')
      .where('ownerId', '==', uid)
      .get();

    const batch = db.batch();
    linksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete user from Firebase Auth
    await admin.auth().deleteUser(uid);

    logEvent(
      'ADMIN_DELETE_USER', 
      req.user, // The Admin performing the action
      uid,      // The Target User ID
      `Admin deleted user ${uid} and removed ${linksSnapshot.size} links.`, 
      req
    );

    res.json({ success: true, message: 'User and their links deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Admin delete any link
const adminDeleteLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    const linkData = doc.data();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Link not found' });
    }
    await docRef.delete();


    logEvent(
      'ADMIN_DELETE_LINK', 
      req.user, 
      slug, 
      `Admin force-deleted link to ${linkData.originalUrl} (Owner: ${linkData.ownerId})`, 
      req
    );
    res.json({ success: true, message: 'Link deleted by admin' });
  } catch (error) {
    console.error('Admin delete link error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Get user details with all their links
const getUserDetails = async (req, res) => {
  try {
    const { uid } = req.params;

    // Get user from Firebase Auth
    const userRecord = await admin.auth().getUser(uid);

    // Get all links for this user
    const linksSnapshot = await db.collection('links')
      .where('ownerId', '==', uid)
      .get();

    const links = linksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        originalUrl: data.originalUrl,
        clickCount: data.clickCount || 0,
        createdAt: data.createdAt,
        security: {
          type: data.security?.type || 'none',
          password: !!data.security?.password,
          expiresAt: data.security?.expiresAt || null,
          maxClicks: data.security?.maxClicks || null,
          allowedDomain: data.security?.allowedDomain || null,
        },
      };
    });

    // Calculate total clicks
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);

    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || null,
        createdAt: userRecord.metadata.creationTime 
          ? { _seconds: Math.floor(new Date(userRecord.metadata.creationTime).getTime() / 1000) }
          : null,
        lastSignInTime: userRecord.metadata.lastSignInTime || null,
      },
      links,
      stats: {
        totalLinks: links.length,
        totalClicks,
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Get single link details
const getLinkDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const data = doc.data();

    // Get owner info
    let owner = null;
    if (data.ownerId && data.ownerId !== 'guest') {
      try {
        const userRecord = await admin.auth().getUser(data.ownerId);
        owner = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
        };
      } catch (e) {
        owner = { uid: data.ownerId, email: 'Unknown', displayName: null };
      }
    }

    res.json({
      _id: doc.id,
      originalUrl: data.originalUrl,
      ownerId: data.ownerId,
      owner,
      clickCount: data.clickCount || 0,
      createdAt: data.createdAt,
      security: {
        type: data.security?.type || 'none',
        password: data.security?.password || null, // Include actual password for admin
        expiresAt: data.security?.expiresAt || null,
        maxClicks: data.security?.maxClicks || null,
        allowedDomain: data.security?.allowedDomain || null,
      },
    });
  } catch (error) {
    console.error('Get link details error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Update link (Admin)
const updateLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const { targetUrl, ttlMinutes, maxClicks, password, allowedDomain } = req.body;

    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const currentData = doc.data();
    const updates = {};

    // Update target URL if provided
    if (targetUrl !== undefined) {
      updates.originalUrl = targetUrl;
    }

    // Build security updates
    const security = { ...currentData.security };

    // Update TTL/expiration
    if (ttlMinutes !== undefined) {
      if (ttlMinutes === null || ttlMinutes === 0) {
        security.expiresAt = null;
      } else {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);
        security.expiresAt = expiresAt.toISOString();
      }
    }

    // Update max clicks
    if (maxClicks !== undefined) {
      security.maxClicks = maxClicks === 0 ? null : maxClicks;
    }

    // Update password
    if (password !== undefined) {
      security.password = password || null;
      security.type = password ? 'password' : (security.allowedDomain ? 'domain' : 'none');
    }

    // Update allowed domain
    if (allowedDomain !== undefined) {
      security.allowedDomain = allowedDomain || null;
      if (!security.password && allowedDomain) {
        security.type = 'domain';
      } else if (!security.password && !allowedDomain) {
        security.type = 'none';
      }
    }

    updates.security = security;
    updates.updatedAt = new Date().toISOString();
    updates.updatedBy = req.user.uid;

    await docRef.update(updates);

    logEvent(
      'ADMIN_UPDATE_LINK', 
      req.user, 
      slug, 
      `Admin modified link settings (Target: ${targetUrl || 'unchanged'}, Security: ${security.type})`, 
      req
    );

    res.json({ 
      success: true, 
      message: 'Link updated successfully',
      link: {
        _id: slug,
        ...currentData,
        ...updates,
      }
    });
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const snapshot = await db.collection('system_logs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        ...data,
        // Convert Timestamp to readable string
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null
      };
    });

    res.json(logs);
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

module.exports = {
  requireAdmin,
  getAllUsers,
  getAllLinks,
  getAdminStats,
  deleteUser,
  adminDeleteLink,
  getUserDetails,
  getLinkDetails,
  updateLink,
  getSystemLogs
};
