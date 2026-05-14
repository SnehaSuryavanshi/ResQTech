# 🚑 ResQAI — AI-Powered Emergency Healthcare Platform

> **Hackathon-winning** full-stack MERN application that uses AI to analyze emergency symptoms, recommend the best hospital, dispatch ambulances, and save lives.

---

## 🎯 Overview

ResQAI combines **Artificial Intelligence**, **real-time data**, and **smart routing** to dramatically reduce emergency response time. When every second counts, ResQAI ensures patients reach the right hospital — not just the nearest one.

### Key Capabilities
- 🧠 AI symptom analysis with severity prediction
- 🏥 Smart hospital ranking (distance + ICU beds + specialty match)
- 🚑 Live ambulance tracking (Uber-style)
- 🆘 One-tap SOS with location broadcast
- 💬 AI chat triage assistant
- 🗺️ Emergency map with heatmaps
- 🩹 AI-guided first aid
- 📊 Admin analytics dashboard

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Framer Motion, SCSS Modules |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | MongoDB (Mongoose) |
| **AI** | Google Gemini API (with rule-based fallback) |
| **Maps** | Leaflet + OpenStreetMap (free, no API key) |
| **Auth** | JWT + bcryptjs |
| **Realtime** | Socket.IO |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
ResQAI/
├── frontend/                  # React Vite Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── components/        # Reusable UI (Navbar, Sidebar, Footer)
│       ├── context/           # AuthContext (JWT state management)
│       ├── layouts/           # MainLayout, DashboardLayout
│       ├── pages/             # All page components
│       │   ├── Landing/       # Homepage hero + features
│       │   ├── Login/         # Auth login page
│       │   ├── Register/      # Auth register page
│       │   ├── Dashboard/     # User dashboard
│       │   ├── Chat/          # AI triage chatbot
│       │   ├── Map/           # Emergency live map
│       │   ├── Hospitals/     # Hospital directory
│       │   ├── SOS/           # Emergency SOS trigger
│       │   ├── Ambulance/     # Live ambulance tracking
│       │   ├── FirstAid/      # AI first aid guides
│       │   ├── Profile/       # User medical profile
│       │   └── Admin/         # Admin analytics dashboard
│       ├── services/          # API service layer (Axios)
│       └── styles/            # SCSS architecture (variables, mixins, animations)
│
├── backend/                   # Express.js API Server
│   ├── package.json
│   ├── server.js              # Express entry point
│   ├── .env / .env.example    # Environment variables
│   ├── config/                # Database config (MongoDB)
│   ├── controllers/           # Route handlers
│   │   ├── authController.js
│   │   ├── hospitalController.js
│   │   ├── emergencyController.js
│   │   ├── ambulanceController.js
│   │   ├── aiController.js
│   │   └── adminController.js
│   ├── middleware/             # Auth (JWT), error handling
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Hospital.js
│   │   ├── Emergency.js
│   │   └── Ambulance.js
│   ├── routes/                # API route definitions
│   ├── services/              # AI service (Gemini + fallback)
│   ├── sockets/               # Socket.IO event handlers
│   └── utils/                 # Seed data script
│
├── server/                    # Server Config
│   ├── server.js              # Production server launcher
│   └── README.md              # Server documentation
│
├── package.json               # Root monorepo scripts
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **MongoDB** (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/ResQAI.git
cd ResQAI

# Install all dependencies (frontend + backend)
npm run install:all

# Or install individually:
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure Environment

Copy `backend/.env.example` → `backend/.env` and fill in:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/resqai
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key     # optional (rule-based fallback available)
GOOGLE_MAPS_API_KEY=your_maps_key  # optional
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 5 hospitals with realistic bed/specialty data
- 5 ambulances with drivers
- Demo user: `user@resqai.com` / `user123`
- Admin user: `admin@resqai.com` / `admin123`

### 4. Run the Application

```bash
# Terminal 1 — Backend API (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

---

## 🔌 API Documentation

### Auth APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |

### Hospital APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hospitals` | List all (supports `?lat=&lng=&specialty=&hasICU=true`) |
| GET | `/api/hospitals/:id` | Hospital details |
| PUT | `/api/hospitals/:id/beds` | Update bed availability (admin) |
| POST | `/api/hospitals` | Create hospital (super_admin) |

### Emergency APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emergencies` | Create emergency + AI analysis |
| GET | `/api/emergencies` | User's emergency history |
| GET | `/api/emergencies/:id` | Single emergency details |
| POST | `/api/emergencies/:id/sos` | Trigger SOS alert |
| POST | `/api/emergencies/analyze` | Analyze symptoms (no emergency created) |

### AI APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/first-aid` | Get first aid guide (public) |

### Ambulance APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ambulances` | List all ambulances |
| PUT | `/api/ambulances/:id/location` | Update live location |
| PUT | `/api/ambulances/:id/status` | Update status |

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics` | Dashboard analytics (admin) |
| GET | `/api/admin/emergencies` | All emergencies (admin) |

---

## 🎨 Design System

Custom SCSS architecture — **zero CSS frameworks**:
- **Glassmorphism** — frosted glass cards with `backdrop-filter: blur()`
- **Gradient accents** — `#ff3b5c` → `#00c2ff` → `#6c63ff`
- **Dark theme** — Deep navy `#0a0f1e` background
- **CSS Modules** — scoped, collision-free styling
- **Framer Motion** — smooth page transitions and micro-animations
- **Mobile-first** — responsive with 4 breakpoints (576, 768, 1024, 1280)

---

## 🧠 AI Features

| Feature | Description |
|---------|-------------|
| Symptom Analysis | Severity, predicted condition, risk level, specialist |
| Hospital Ranking | AI scores based on distance, beds, specialty, rating |
| Chat Assistant | Contextual medical conversation |
| First Aid Guides | CPR, choking, burns, bleeding, fractures |
| Fallback Engine | Rule-based analysis when Gemini API unavailable |

---

## 📱 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Render/Railway
```bash
cd backend
# Deploy directly from GitHub → Render
# Set environment variables in dashboard
```

---

## 📄 License

MIT License — Built with ❤️ for saving lives.
