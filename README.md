# LifeLink — Real-Time Blood Donor Coordination Platform

LifeLink is a production-grade, real-time emergency blood donor coordination network built with **React + Vite**, **Node.js + Express**, **MongoDB Geospatial Indexing (`2dsphere`)**, and **Socket.IO**.

---

## 🚑 Key Features

- **Real-Time Geospatial Proximity Matching**: Leverages MongoDB's native `$geoNear` aggregation pipeline and `2dsphere` index to locate compatible donors in proximity to hospital facilities.
- **Strict Medical Privacy Protection**: Exact donor GPS coordinates and personal contact phone numbers are **strictly concealed** from public APIs. Search feeds display approximate distances (e.g. `~2 km away`) and neighborhood localities. Mutual contact details unlock only after a donor accepts an emergency call.
- **Biological ABO/Rh Compatibility Engine**: Automatically computes biological compatibility rules (e.g. Universal O- RBC donors matched to all patient blood groups; AB+ matched as universal recipients).
- **Socket.IO Real-Time Dispatch Engine**: Dispatches immediate notification alerts to online compatible donors when hospital trauma cases are created. Real-time updates propagate without page refreshes.
- **Interactive Donor Availability System**: Real-time toggle switch persisting availability state directly in MongoDB.
- **Progressive Web App (PWA)**: Installable as a native-like app on Android, iPhone (iOS "Add to Home Screen" guided modal), tablets, and desktops. Includes web manifest, service worker caching, and original themed vector icons.
- **Responsive Mobile-First Interface**: Mobile navigation tab bar for hand-held viewports (<768px), animated radar scanner for donor discovery, and comprehensive admin dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Socket.IO Client, VitePWA Plugin.
- **Backend**: Node.js, Express, Socket.IO, Mongoose, JWT (JSON Web Tokens), Bcrypt.js, Morgan.
- **Database**: MongoDB with `2dsphere` geospatial indexing.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017/lifelink`) or provide a `MONGODB_URI` in `server/.env`.

### 2. Install Dependencies
```bash
# In project root
npm run install:all
```

### 3. Seed Realistic Test Data
```bash
cd server
node seedData.js
```

### 4. Run the Application

#### Option A: Full Development Mode (with Vite HMR)
```bash
# In project root
npm run dev
```
- Client runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:5000`

#### Option B: Integrated Single-URL Production Mode
```bash
# In project root
npm run build
npm start
```
- Access everything at: `http://localhost:5000`

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Notes |
|---|---|---|---|
| **Chief Admin** | `admin@lifelink.org` | `Password123!` | System analytics, telemetry, user verification |
| **Universal Donor (O-)** | `sarah.oneg@donor.lifelink.org` | `Password123!` | Westside Corridor, 8 verified donations |
| **A+ Donor** | `marcus.apos@donor.lifelink.org` | `Password123!` | Downtown Plaza, available |
| **Emergency Requester** | `elena.requester@lifelink.org` | `Password123!` | Hospital coordinator |

*Tip: The Login page includes 1-click demo account buttons to sign in without typing.*

---

## 📁 Project Architecture

```
LifeLink/
├── package.json                   # Root orchestrator scripts
├── server/
│   ├── config/                    # MongoDB and Socket.IO initialization
│   ├── controllers/               # Auth, Donor, Request, and Admin logic
│   ├── models/                    # Mongoose schemas (User, DonorProfile, BloodRequest, DonationHistory)
│   ├── routes/                    # Express REST endpoints
│   ├── middleware/                # JWT protect and RBAC authorization
│   ├── utils/                     # Blood compatibility matrix and privacy filter
│   ├── seedData.js                # Database seeder
│   ├── testGeo.js                 # Geospatial pipeline verification
│   ├── testE2E.js                 # Complete E2E verification test
│   └── server.js                  # Main server & static asset handler
└── client/
    ├── public/                    # PWA Web manifest and original SVG icons
    └── src/
        ├── components/            # Navbar, BottomNav, BloodRadar, PwaInstallPrompt, etc.
        ├── context/               # AuthContext, SocketContext, LocationContext
        ├── pages/                 # Landing, Login, Register, DonorHub, CreateRequest, Admin, etc.
        ├── services/              # REST API and Socket client
        └── App.jsx                # Router and application layout
```
