# 🔐 GateKeeper - Secure URL Shortener

A secure, self-destructing URL shortener with advanced analytics, geographic heatmaps, and multi-layer security features.

![GateKeeper](https://img.shields.io/badge/GateKeeper-URL%20Shortener-E71D36?style=for-the-badge)

## ✨ Features

- 🔗 **URL Shortening** - Create custom or random short links
- 🔒 **Multi-layer Security** - Password protection & Google Workspace domain lock
- 💣 **Self-Destructing Links** - Set expiration dates or click limits
- 📊 **Advanced Analytics** - Track clicks, countries, cities, referrers
- 🗺️ **Geographic Heatmaps** - Visualize click locations on an interactive map
- 📥 **CSV Export** - Export analytics data for external analysis
- 🏷️ **Link Tagging** - Organize links with custom tags
- 📱 **QR Code Generation** - Generate QR codes for any link
- 🤖 **AI-Powered URL Scanning** - Detect malicious links with Gemini AI
- 🎨 **Dual Theme** - Neo-brutalist light theme & Stranger Things dark mode

---

## 🏗️ Tech Stack

### Backend
- Node.js + Express
- Firebase Admin SDK (Firestore + Auth)
- GeoIP-lite for location detection
- Helmet + Rate Limiting for security

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React-Leaflet for maps
- Lucide Icons

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Firestore & Authentication enabled

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/gatekeeper.git
cd gatekeeper
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Add your Firebase service account key
# Download from Firebase Console > Project Settings > Service Accounts
# Save as serviceAccountKey.json in the backend folder

# Edit .env with your values
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your Firebase config
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📦 Deployment

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_APP_URL=https://your-vercel-app.vercel.app
   ```
4. Deploy!

#### Deploy Backend to Railway

1. Create new project in [Railway](https://railway.app)
2. Connect your GitHub repo (select backend folder)
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   GEMINI_API_KEY=your_gemini_key
   FIREBASE_SERVICE_ACCOUNT_BASE64=<base64 encoded service account>
   ```
4. To encode your service account:
   ```bash
   # On Mac/Linux
   base64 -i serviceAccountKey.json | tr -d '\n'
   
   # On Windows PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json"))
   ```
5. Deploy!

---

### Option 2: Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## 🔧 Environment Variables Reference

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS & links | Yes | `http://localhost:5173` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | No | `http://localhost:5173` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to service account JSON | Yes* | `./serviceAccountKey.json` |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64 encoded service account | Yes* | - |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | `100` |

*Either `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_BASE64` is required

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | No |
| `VITE_APP_URL` | Your app's public URL | Yes |

---

## 🔐 Security Considerations

1. **Never commit sensitive files:**
   - `serviceAccountKey.json`
   - `.env` files with real credentials
   - Any file containing API keys

2. **Production Checklist:**
   - [ ] Set `NODE_ENV=production`
   - [ ] Configure proper CORS origins
   - [ ] Enable rate limiting
   - [ ] Use HTTPS only
   - [ ] Rotate API keys regularly
   - [ ] Monitor for suspicious activity

3. **Firebase Security Rules:**
   Ensure your Firestore rules restrict access appropriately.

---

## 📝 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/link` | Create short link | Optional |
| GET | `/api/link/:slug` | Check/redirect link | No |
| POST | `/api/link/:slug/unlock` | Unlock password-protected link | No |
| PUT | `/api/link/:slug` | Update link (slug/tags) | Yes |
| DELETE | `/api/link/:slug` | Delete link | Yes |
| GET | `/api/link/:slug/analytics` | Get link analytics | Yes |
| GET | `/api/dashboard` | Get user's links | Yes |
| GET | `/api/health` | Health check | No |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for authentication & database
- [Leaflet](https://leafletjs.com/) for mapping
- [GeoIP-lite](https://github.com/bluesmoon/node-geoip) for geolocation
- [Lucide](https://lucide.dev/) for icons
