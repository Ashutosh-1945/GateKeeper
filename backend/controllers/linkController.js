const { db, auth } = require('../config/firebase'); // 👈 IMPORT AUTH HERE
const { nanoid } = require('nanoid');
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const logEvent = require('../utils/logger');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Create Link
exports.createLink = async (req, res) => {
  try {
    console.log("Create Link Request Body:", req.body);
    const { originalUrl, customSlug, password, expiresAt, maxClicks, allowedDomain, securityType } = req.body;
    const ownerId = req.user ? req.user.uid : 'guest';

    console.log('Creating link for user:', ownerId, '| Type:', securityType);

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Validate Domain Lock
    if (securityType === 'domain_lock' && !allowedDomain) {
      return res.status(400).json({ error: 'Domain is required for Domain Lock security.' });
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

    res.status(201).json({ shortLink: `http://localhost:5173/${slug}`, slug });

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

    // Success - Increment & Return
    await docRef.update({
      clickCount: admin.firestore.FieldValue.increment(1)
    });

    logEvent('LINK_ACCESS', null, slug, `Visitor accessed link`, req);

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

    logEvent('LINK_CREATE', req.user, slug, `Created link to ${originalUrl}`, req);

  } catch (error) {
    console.error('Delete Link Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

