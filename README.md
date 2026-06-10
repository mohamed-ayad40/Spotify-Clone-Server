<div align="center">

# 🎵 Spotify Clone — Backend API

The server powering the Spotify Clone — built with Node.js, Express, and MongoDB, featuring Google OAuth, session management, Cloudinary media uploads, and JWT authentication.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

**[🌐 Live API](https://spotify-clone-server-tau.vercel.app)** · **[📱 Frontend Repo](https://github.com/mohamed-ayad40/Spotify-Clone-3)**

</div>

---

## ✨ Features

- **JWT Authentication** — Secure token-based login with bcrypt password hashing
- **Google OAuth 2.0** — Sign in with Google via Passport.js (`passport-google-oauth20`)
- **Session Management** — Persistent sessions stored in MongoDB via `connect-mongo`
- **Media Uploads** — Audio and image file handling with Multer + Cloudinary storage
- **Mongoose ODM** — Structured data models for users, songs, and playlists
- **ESM Modules** — Modern JavaScript with native ES module syntax

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt + Passport.js |
| OAuth | Google OAuth 2.0 |
| Sessions | express-session + connect-mongo |
| Media | Multer + Cloudinary |
| Deployment | Vercel |

---

## 🚀 Getting Started

```bash
git clone https://github.com/mohamed-ayad40/Spotify-Clone-Server.git
cd Spotify-Clone-Server
npm install
# Add MONGODB_URI, JWT_SECRET, CLOUDINARY_*, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET to .env
npm start
```

---

## 📄 License

MIT © [Mohamed Ayad](https://github.com/mohamed-ayad40)
