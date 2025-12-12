const { db, auth } = require('../config/firebase'); // 👈 IMPORT AUTH HERE
const { nanoid } = require('nanoid');
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const logEvent = require('../utils/logger');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const geoip = require('geoip-lite');
const crypto = require('crypto');

// Get frontend URL from environment
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

// Create Link
exports.createLink = async (req, res) => {
  try {
    console.log("Create Link Request Body:", req.body);
    const { originalUrl, customSlug, password, expiresAt, maxClicks, allowedDomain, securityType, tags } = req.body;
    const ownerId = req.user ? req.user.uid : 'guest';

    console.log('Creating link for user:', ownerId, '| Type:', securityType);

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Validate Domain Lock
    if (securityType === 'domain_lock' && !allowedDomain) {
      return res.status(400).json({ error: 'Domain is required for Domain Lock security.' });
    }

    // Validate tags (ensure it's an array of strings)
    const validTags = Array.isArray(tags) 
      ? tags.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim().toLowerCase())
      : [];

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
      tags: validTags, // 👈 NEW: Tags array
      security: {
        type: securityType || 'none', // 'none', 'password', 'domain_lock'
        password: password || null,
        allowedDomain: securityType === 'domain_lock' ? allowedDomain : null, 
        expiresAt: expiresAt || null,
        maxClicks: maxClicks ? parseInt(maxClicks) : null
      },
      clickCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('links').doc(slug).set(newLink);

    logEvent('LINK_CREATE', req.user, slug, `Created link to ${originalUrl}`, req);

    res.status(201).json({ shortLink: `${FRONTEND_URL}/${slug}`, slug });

  } catch (error) {
    console.error('Create Link Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Check Link (Public Access Logic)
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
      logEvent('LINK_AUTO_DELETE', null, slug, 'Link self-destructed (Expired/Burned)', req);
      return res.status(410).json({ error: 'This link has self-destructed' });
    }

    // Check 3: Domain Lock (Google Gate) 👇 NEW
    if (link.security.type === 'domain_lock') {
      return res.json({ 
        google_gate: true, 
        requiredDomain: link.security.allowedDomain 
      });
    }

    // Check 4: Password Protection
    if (link.security.password) {
      return res.json({ protected: true });
    }

    const userAgent = req.headers['user-agent'] || '';
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|whatsapp|slack|twitterbot|discordbot/i.test(userAgent);
    const isPrefetch = req.headers['x-moz'] === 'prefetch' || req.headers['sec-fetch-purpose'] === 'prefetch';

    if (isBot || isPrefetch) {
      return res.json({ originalUrl: link.originalUrl });
    }

    // ========== DETAILED ANALYTICS LOGGING ==========
    // Get visitor's IP (handle proxies)
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress || 
               'unknown';
    
    console.log('[DEBUG] Raw IP:', ip);
    
    // GeoIP lookup for full geo data (country, city, lat, lng)
    let geoData = {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      latitude: null,
      longitude: null
    };
    
    try {
      // Clean IP (remove IPv6 prefix if present)
      const cleanIp = ip.replace(/^::ffff:/, '');
      console.log('[DEBUG] Clean IP:', cleanIp);
      
      // Check if localhost - use test data for development only
      const isLocalhost = cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost';
      
      if (isLocalhost && !isProduction) {
        // Use random test locations for localhost development
        const testLocations = [
          { country: 'US', city: 'New York', region: 'NY', latitude: 40.7128, longitude: -74.0060 },
          { country: 'GB', city: 'London', region: 'ENG', latitude: 51.5074, longitude: -0.1278 },
          { country: 'JP', city: 'Tokyo', region: '13', latitude: 35.6762, longitude: 139.6503 },
          { country: 'DE', city: 'Berlin', region: 'BE', latitude: 52.5200, longitude: 13.4050 },
          { country: 'FR', city: 'Paris', region: 'IDF', latitude: 48.8566, longitude: 2.3522 },
          { country: 'AU', city: 'Sydney', region: 'NSW', latitude: -33.8688, longitude: 151.2093 },
          { country: 'BR', city: 'Sao Paulo', region: 'SP', latitude: -23.5505, longitude: -46.6333 },
          { country: 'IN', city: 'Mumbai', region: 'MH', latitude: 19.0760, longitude: 72.8777 },
          { country: 'CA', city: 'Toronto', region: 'ON', latitude: 43.6532, longitude: -79.3832 },
          { country: 'ZA', city: 'Cape Town', region: 'WC', latitude: -33.9249, longitude: 18.4241 },
        ];
        const randomLoc = testLocations[Math.floor(Math.random() * testLocations.length)];
        geoData = randomLoc;
        console.log('[DEBUG] Using test location for localhost:', geoData);
      } else {
        const geo = geoip.lookup(cleanIp);
        console.log('[DEBUG] GeoIP result:', geo);
        if (geo) {
          geoData = {
            country: geo.country || 'Unknown',
            city: geo.city || 'Unknown',
            region: geo.region || 'Unknown',
            latitude: geo.ll ? geo.ll[0] : null,
            longitude: geo.ll ? geo.ll[1] : null
          };
        }
      }
    } catch (geoErr) {
      console.warn('GeoIP lookup failed:', geoErr.message);
    }
    
    console.log('[DEBUG] Final geoData:', geoData);

    // Get referrer
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'direct';

    // Hash the IP for privacy (SHA256, truncated)
    const hashedIp = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

    // Click data to save in clicks sub-collection (for heatmap)
    const clickData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      country: geoData.country,
      city: geoData.city,
      region: geoData.region,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      referrer,
      userAgent: userAgent.substring(0, 200), // Truncate long UAs
      hashedIp, // Privacy-friendly
    };

    // Save to clicks sub-collection (for heatmap visualization)
    docRef.collection('clicks').add(clickData).catch(err => {
      console.error('Click logging failed:', err.message);
    });

    // Also log to analytics sub-collection for backward compatibility
    docRef.collection('analytics').add(clickData).catch(err => {
      console.error('Analytics logging failed:', err.message);
    });

    // Success - Increment & Return
    await docRef.update({
      clickCount: admin.firestore.FieldValue.increment(1)
    });

    logEvent('LINK_ACCESS', null, slug, `Visitor from ${geoData.country}/${geoData.city} accessed link`, req);

    res.json({ originalUrl: link.originalUrl });

  } catch (error) {
    console.error('Check Link Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Unlock Link (Password)
exports.unlockLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const { password } = req.body;
    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'Not Found' });

    const link = doc.data();

    if (link.security.password !== password) {
      logEvent('AUTH_FAIL', null, slug, 'Incorrect password attempt', req);
      return res.status(401).json({ error: 'Incorrect password' });
    }

    logEvent('LINK_UNLOCK_PASS', null, slug, 'Visitor unlocked via password', req);

    await docRef.update({ clickCount: admin.firestore.FieldValue.increment(1) });
    res.json({ originalUrl: link.originalUrl });

  } catch (error) {
    console.error('Unlock Link Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Unlock Link (Google Domain Lock)
exports.unlockWithGoogle = async (req, res) => {
  try {
    const { slug } = req.params;
    const { idToken } = req.body; // Sent from frontend after Google Login

    if (!idToken) return res.status(400).json({ error: "No token provided" });

    // A. Verify the Google Token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    // B. Get Link Rules
    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'Link not found' });
    
    const link = doc.data();
    const requiredDomain = link.security.allowedDomain;

    // C. Check Domain Match
    if (!userEmail.endsWith(`@${requiredDomain}`)) {
      logEvent('AUTH_FAIL', { email: userEmail, uid: 'google_guest' }, slug, `Domain mismatch: ${userEmail}`, req);
      return res.status(403).json({ 
        error: `Access Denied. You must use an email from: @${requiredDomain}. Your email: ${userEmail}` 
      });
    }
    logEvent('LINK_UNLOCK_DOMAIN', { email: userEmail, uid: decodedToken.uid }, slug, `Unlocked by ${userEmail}`, req);
    // D. Success
    await docRef.update({ clickCount: admin.firestore.FieldValue.increment(1) });
    res.json({ originalUrl: link.originalUrl });

  } catch (error) {
    console.error("Google Unlock Error:", error);
    res.status(401).json({ error: "Authentication failed or token invalid." });
  }
};

// Initialize Gemini 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.scanUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    console.log(`🔍 Scanning: ${url}`);

    // 1. Scrape the Site (Improved with User-Agent)
    let pageData = { title: "No Title Found", text: "No Content Accessible" };
    
    try {
      // Fake a real browser so we don't get blocked
      const response = await axios.get(url, { 
        timeout: 5000,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
        }
      });
      
      const $ = cheerio.load(response.data);
      pageData.title = $('title').text().trim().substring(0, 100) || "No Title";
      // Get paragraphs and headers for better context
      pageData.text = $('p, h1, h2, h3').text().replace(/\s+/g, ' ').trim().substring(0, 600);
      
      console.log(`✅ Scrape Success: "${pageData.title}"`);
      
    } catch (err) {
      console.warn(`⚠️ Scrape Failed (${err.message}). AI will judge URL only.`);
    }

    // 2. Ask Gemini (The "Paranoid" Brain)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Or 2.5-flash if available
    
    const prompt = `
      Act as a strict Cybersecurity Analyst. Analyze this website.

      INPUT DATA:
      - URL: "${url}"
      - Page Title: "${pageData.title}"
      - Page Content: "${pageData.text}"

      STRICT RULES:
      1. If the URL contains "phishing", "test", "malware", or "eicar", mark as UNSAFE immediately.
      2. If the Page Content is empty or "No Content Accessible", mark as SUSPICIOUS (because the site blocked the scan).
      3. If the URL tries to impersonate a brand (e.g. "paypa1.com", "secure-login.xyz") but the domain is wrong, mark UNSAFE.
      4. If it is a known legitimate site (Github, Youtube, Wikipedia), mark SAFE.

      RESPONSE FORMAT (JSON ONLY):
      {
        "status": "safe" | "suspicious" | "unsafe",
        "reason": "Explain why in 10 words or less."
      }
    `;

    const result = await model.generateContent(prompt);
    const jsonStr = result.response.text().replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(jsonStr);

    logEvent('AI_SCAN', req.user, null, `Scanned URL: ${req.body.url}. Verdict: ${analysis.status}`, req);

    

    console.log(`🤖 AI Verdict: ${analysis.status} - ${analysis.reason}`);
    res.json(analysis);

  } catch (error) {
    console.error("Scan Error:", error);
    res.json({ status: "unknown", reason: "Scan system offline." });
  }
};

// Get User Links (Dashboard)
exports.getUserLinks = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const snapshot = await db.collection('links')
      .where('ownerId', '==', req.user.uid)
      .get();

    const links = snapshot.docs.map(doc => {
      const data = doc.data();
      // Remove sensitive data
      const { security, ...rest } = data;
      const safeSecurity = { ...security };
      // delete safeSecurity.password; // Optional: Keep plain text pass visible to owner? Up to you.
      
      return { ...rest, security: safeSecurity };
    });

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
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { slug } = req.params;
    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'Link not found' });

    const link = doc.data();
    if (link.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this link' });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Link destroyed' });

    logEvent('LINK_DELETE', req.user, slug, `Deleted link`, req);

  } catch (error) {
    console.error('Delete Link Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update User Link (Slug Rename + Tags Update)
exports.updateUserLink = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { slug: oldSlug } = req.params;
    const { newSlug, tags } = req.body;

    // Get the existing document
    const oldDocRef = db.collection('links').doc(oldSlug);
    const oldDoc = await oldDocRef.get();

    if (!oldDoc.exists) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const linkData = oldDoc.data();

    // Authorization check
    if (linkData.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this link' });
    }

    // Prepare updates
    const updatedData = { ...linkData };

    // Validate and update tags if provided
    if (tags !== undefined) {
      updatedData.tags = Array.isArray(tags) 
        ? tags.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim().toLowerCase())
        : [];
    }

    // Check if slug is changing
    const slugIsChanging = newSlug && newSlug !== oldSlug;

    if (slugIsChanging) {
      // Validate new slug format (alphanumeric, hyphens, underscores)
      if (!/^[a-zA-Z0-9_-]+$/.test(newSlug)) {
        return res.status(400).json({ error: 'Invalid slug format. Use only letters, numbers, hyphens, and underscores.' });
      }

      // Check if new slug is available
      const newDocRef = db.collection('links').doc(newSlug);
      const newDoc = await newDocRef.get();

      if (newDoc.exists) {
        return res.status(409).json({ error: 'This alias is already taken' });
      }

      // Use Firestore Transaction to move the document
      await db.runTransaction(async (transaction) => {
        // Read old document within transaction (for consistency)
        const freshOldDoc = await transaction.get(oldDocRef);
        if (!freshOldDoc.exists) {
          throw new Error('Link was deleted during update');
        }

        // Update the _id field to match new slug
        updatedData._id = newSlug;
        updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        // Create new document with new slug
        transaction.set(newDocRef, updatedData);

        // Copy analytics sub-collection (if exists)
        // Note: Firestore transactions can't read sub-collections, 
        // so we'll handle analytics migration outside the transaction

        // Delete old document
        transaction.delete(oldDocRef);
      });

      // Migrate analytics sub-collection (outside transaction)
      try {
        const analyticsSnapshot = await db.collection('links').doc(oldSlug).collection('analytics').get();
        if (!analyticsSnapshot.empty) {
          const batch = db.batch();
          analyticsSnapshot.docs.forEach(doc => {
            const newAnalyticsRef = db.collection('links').doc(newSlug).collection('analytics').doc(doc.id);
            batch.set(newAnalyticsRef, doc.data());
          });
          await batch.commit();
          
          // Delete old analytics (cleanup)
          const deleteBatch = db.batch();
          analyticsSnapshot.docs.forEach(doc => {
            deleteBatch.delete(doc.ref);
          });
          await deleteBatch.commit();
        }
      } catch (analyticsErr) {
        console.warn('Analytics migration failed (non-critical):', analyticsErr.message);
      }

      logEvent('LINK_UPDATE', req.user, newSlug, `Renamed slug from ${oldSlug} to ${newSlug}`, req);

      res.json({ 
        success: true, 
        message: 'Link updated successfully',
        newSlug,
        link: { ...updatedData, _id: newSlug }
      });

    } else {
      // Just update tags (no slug change)
      updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await oldDocRef.update({
        tags: updatedData.tags,
        updatedAt: updatedData.updatedAt
      });

      logEvent('LINK_UPDATE', req.user, oldSlug, `Updated link tags`, req);

      res.json({ 
        success: true, 
        message: 'Link updated successfully',
        link: updatedData
      });
    }

  } catch (error) {
    console.error('Update User Link Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Get Link Analytics (for dashboard & heatmap)
exports.getLinkAnalytics = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { slug } = req.params;
    const docRef = db.collection('links').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const link = doc.data();

    // Authorization check
    if (link.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to view this link\'s analytics' });
    }

    // Get clicks sub-collection (for heatmap) - last 500 clicks
    const clicksSnapshot = await docRef.collection('clicks')
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const clicks = clicksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
        country: data.country || 'Unknown',
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        referrer: data.referrer || 'direct',
        userAgent: data.userAgent || '',
        hashedIp: data.hashedIp || ''
      };
    });

    // Aggregate country data for charts
    const countryStats = {};
    const cityStats = {};
    const referrerStats = {};
    const heatmapPoints = [];

    clicks.forEach(click => {
      // Country aggregation
      countryStats[click.country] = (countryStats[click.country] || 0) + 1;
      
      // City aggregation
      if (click.city !== 'Unknown') {
        const cityKey = `${click.city}, ${click.country}`;
        cityStats[cityKey] = (cityStats[cityKey] || 0) + 1;
      }
      
      // Referrer aggregation (simplify to domain)
      let referrerDomain = 'direct';
      if (click.referrer && click.referrer !== 'direct') {
        try {
          referrerDomain = new URL(click.referrer).hostname;
        } catch {
          referrerDomain = click.referrer.substring(0, 50);
        }
      }
      referrerStats[referrerDomain] = (referrerStats[referrerDomain] || 0) + 1;

      // Collect valid lat/lng for heatmap
      if (click.latitude !== null && click.longitude !== null) {
        heatmapPoints.push({
          lat: click.latitude,
          lng: click.longitude,
          intensity: 1
        });
      }
    });

    res.json({
      slug,
      totalClicks: link.clickCount || 0,
      clicks, // Full click data for CSV export
      heatmapPoints, // Lat/lng points for heatmap
      countryStats,
      cityStats,
      referrerStats
    });

  } catch (error) {
    console.error('Get Link Analytics Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

