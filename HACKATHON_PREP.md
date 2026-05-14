# ResQAI Hackathon Preparation Guide

This document provides a brief breakdown of the entire ResQAI codebase in simple terms, followed by an extensive list of questions and answers to prepare you for the hackathon judges.

---

## 📂 Project Breakdown (In Simple Words)

### 1. Frontend (`/frontend`)
*   **What it is:** The user interface (what the user sees and interacts with), built using **React 19** and **Vite** (for super-fast performance).
*   **Key Folders:**
    *   `src/pages/`: Contains all the main screens like Login, Dashboard, Map (live ambulance tracking), Chat (AI symptom triage), Hospitals (directory), and Admin analytics.
    *   `src/components/`: Reusable pieces of the UI like the Navbar, Footer, and buttons.
    *   `src/styles/`: Contains custom CSS/SCSS (you aren't relying on a heavy framework like Bootstrap; you built custom glassmorphism and animations).
    *   `src/services/`: The "bridge" that talks to your backend (usually using Axios to make API requests).
    *   `src/context/`: Manages user login state globally using JWT (JSON Web Tokens).

### 2. Backend (`/backend`)
*   **What it is:** The server engine behind the scenes, built with **Node.js** and **Express.js**. It handles logic, AI communication, and database operations.
*   **Key Folders:**
    *   `server.js`: The main entry point that starts up the server.
    *   `controllers/`: The "brains" for each route. Contains logic for Auth, AI, Ambulances, Emergencies, and Hospitals.
    *   `routes/`: The URLs the frontend calls (e.g., `/api/auth/login`).
    *   `models/`: Defines what data looks like in the database (Users, Hospitals, Emergencies, Ambulances).
    *   `sockets/`: Handles real-time features using **Socket.IO** (like live Uber-style ambulance tracking on the map).
    *   `services/`: Connects to external services, mainly the **Google Gemini API** for symptom analysis.
    *   `middleware/`: Security checkpoints (e.g., verifying a user is logged in before they can book an ambulance).

### 3. Database (MongoDB)
*   **What it is:** A NoSQL database that stores all your application data. You are using **Mongoose** to interact with it easily.

---

## ⚖️ Hackathon Judge Q&A Prep

Judges look for **impact, technical depth, and architectural choices**. Here is a cheat sheet categorized by domain.

### 🎨 1. Frontend Questions

**Q: Why did you choose React with Vite instead of something like Next.js or Create React App?**
**A:** We chose React with Vite because Vite provides lightning-fast Hot Module Replacement (HMR) and optimized build times. Since this is a hackathon, development speed was critical. We didn't need the server-side rendering (SSR) overhead of Next.js for an app that behaves like an interactive dashboard.

**Q: How are you managing state in your application?**
**A:** We are using React's built-in Context API for global state like User Authentication (`AuthContext`), combined with standard React Hooks (`useState`, `useEffect`) for local component state. It keeps the bundle size small without the boilerplate of Redux.

**Q: How did you implement the styling and animations without a framework like Tailwind?**
**A:** We used SCSS modules to keep styles scoped to components and avoid CSS collisions. For the modern UI (glassmorphism, dark theme), we used raw CSS properties like `backdrop-filter`. For smooth transitions, we integrated **Framer Motion**, which gives it a premium, native-app feel.

### ⚙️ 2. Backend & Server Questions

**Q: Why Node.js and Express?**
**A:** Node.js is asynchronous and event-driven, which makes it perfect for a real-time application like ours where we are juggling API requests, AI processing, and live WebSocket connections (Socket.IO) simultaneously.

**Q: How does the live ambulance tracking work?**
**A:** We use **Socket.IO** for bidirectional real-time communication. The ambulance (or driver app) emits its current GPS coordinates to the server via WebSockets, and the server immediately broadcasts those coordinates to the user's frontend, updating the map marker without the user having to refresh the page.

**Q: What happens if your server crashes during an emergency request?**
**A:** We implemented error-handling middleware to catch failures gracefully. Furthermore, we designed our architecture so that the frontend handles disconnections gracefully and attempts to reconnect. *(Bonus: Mention if you have PM2 or auto-restart scripts running in deployment).*

### 🗄️ 3. Database Questions

**Q: Why NoSQL (MongoDB) instead of SQL (PostgreSQL/MySQL)?**
**A:** Emergency data can be highly unstructured. A patient's symptoms, AI analysis results, and changing hospital metrics fit naturally into JSON-like documents. MongoDB gives us the schema flexibility to adapt quickly during a hackathon without writing complex database migrations.

**Q: How do you query the "nearest" hospital? Are you doing the math on the server?**
**A:** We can use MongoDB's built-in Geospatial Queries (`$near` or `$geoNear` with a `2dsphere` index) to instantly find hospitals within a certain radius of the user's latitude and longitude, making it highly efficient.

### 🤖 4. AI & Tech Integration Questions

**Q: How exactly are you using the Google Gemini API?**
**A:** We use Gemini to act as a triage assistant. When a user inputs their symptoms or chats with the bot, we send a crafted prompt to Gemini. The API returns a structured analysis including severity prediction, risk level, and the recommended medical specialist. 

**Q: What happens if the Gemini API goes down or hits a rate limit?**
**A:** We built a **rule-based fallback engine**. If the external AI API fails or times out, our backend catches the error and runs the symptoms against a local, pre-defined set of keyword rules to ensure the user still gets life-saving guidance and severity assessment without interruption.

**Q: Google Maps API is expensive. How are you rendering maps?**
**A:** We chose an open-source approach to keep the project completely free and scalable. We use **Leaflet.js** integrated with **OpenStreetMap** data. It allows us to render maps, place custom markers for hospitals, and track ambulances without worrying about API key billing limits.

### 🔒 5. Security Questions

**Q: How are you securing user data?**
**A:** 
1. **Passwords:** We hash all passwords using `bcryptjs` before saving them to the database.
2. **Authentication:** We use JWT (JSON Web Tokens). The token is sent back to the client and must be provided in the `Authorization` header for protected routes.
3. **Environment Variables:** All sensitive keys (Database URIs, API keys, JWT secrets) are hidden inside a `.env` file and never pushed to GitHub.

---
### 💡 Pro-Tip for the Pitch
When presenting, focus on the **Impact**. Judges love tech, but they vote for solutions. 
Say: *"ResQAI isn't just an app; it's a platform that eliminates the panic of an emergency. By combining WebSockets for live tracking with Gemini AI for instant medical triage, we save the most valuable resource in healthcare: **Time**."*
