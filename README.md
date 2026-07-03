# ⚡ Servio - Real-Time Local Service Concierge

Servio is a state-of-the-art, real-time on-demand service finder dashboard designed to seamlessly connect customers with nearby trusted local service providers (electricians, plumbers, AC mechanics, carpenters, and more). Featuring AI-powered voice diagnostics, live geographic tracking, instant bidding/negotiation, and real-time messaging, Servio brings enterprise-grade concierge tools directly to your local community.

---

## 🚀 Key Features

### 1. **Live GPS Map Tracking & Matching**
- Interactive **Leaflet-based maps** showing real-time positions of active service providers.
- **SOS Emergency Match**: An instant dispatch system that broadcasts urgent requests to all available providers within a custom radius when specific category matches are unavailable.
- Live provider location simulation and automatic status toggles (busy, offline, available) synchronized via WebSockets.

### 2. **Gemini AI Diagnostics & Voice Transcription**
- **Real-Time Voice Audits**: Users can upload a voice note describing their home/technical emergency.
- The **Gemini API** decodes, transcribes, and analyzes the voice note in real time to:
  - Transcribe the language (supporting English, Roman Urdu, and Urdu).
  - Automatically classify the correct service type.
  - Diagnose the issue and estimate urgency levels (Normal, Medium, High).
  - Suggest estimated price ranges and necessary spare parts.

### 3. **Interactive Live Bidding & Price Negotiation**
- Real-time bid negotiation system allowing customers and service providers to propose, accept, or reject pricing offers instantly.
- Locks the final service cost dynamically upon mutual agreement.

### 4. **Live Parts Invoice Management**
- Providers can draft and submit an itemized spare parts invoice directly through the chat dashboard.
- Customers receive a real-time prompt to approve or reject individual invoices, automatically updating the final job cost.

### 5. **Real-Time Chat & Simulation Console**
- End-to-end communication via WebSocket connection between customers and their assigned partners.
- **Simulation Console**: Built-in developer suite that spawns virtual mock providers onto the map, simulates movement drifts, and sends automated chatbot responses using preset contextual replies.

### 6. **Provider Gamification & Level-Up System**
- Servio rewards service partners on successful job completions with experience points (+150 XP).
- Automatic level-ups trigger live congratulatory notifications.
- Partners unlock premium rank badges: **Rookie** ➡️ **Bronze Pro** ➡️ **Silver Expert** ➡️ **Golden Legend**.

### 7. **Elevated Premium Styling**
- A high-end **Glassmorphism Design System** with native Dark and Light modes.
- Curated color scheme aligned with our official branding colors: **Logo Blue** (`#1D4ED8`) and **Logo Green/Teal** (`#00C08B`).

---

## 🛠️ Technology Stack

### **Frontend**
- **Core Library**: React (v18)
- **Bundler & Tooling**: Vite
- **Styling**: Modern Custom CSS variables with glassmorphism effects and responsive grids
- **State & Sync**: React Context API (`AuthContext`, `SocketContext`), Socket.io-client
- **Maps**: React-Leaflet / Leaflet.js
- **Icons**: Lucide React

### **Backend**
- **Server Framework**: Node.js & Express.js
- **Real-Time Layer**: Socket.io (WebSocket framework)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **AI API**: Google Gemini API Integration (`@google/generative-ai`)
- **Database**: Local JSON Database Engine (`data/users.json`, `data/transactions.json`) with an automated file-based schema query engine.

---

## 📦 Project Directory Structure

```
Servio/
├── backend/
│   ├── config/            # DB configuration & Gemini API setup
│   ├── data/              # JSON database models (users, transactions, requests)
│   ├── routes/            # REST API endpoints (auth, providers, requests)
│   ├── socket/            # WebSocket handlers (chat, bidding, tracking)
│   ├── server.js          # Main Express app & HTTP/Socket server
│   └── package.json
│
├── frontend/
│   ├── public/            # Static assets (logo_icon.png, favicon.png, backgrounds)
│   ├── src/
│   │   ├── components/    # Reusable UI widgets (Header, ProfileModal, SimulationPanel)
│   │   ├── context/       # Socket & Auth global state management
│   │   ├── App.jsx        # Core application routing & dashboard layouts
│   │   ├── index.css      # Premium Glassmorphism styling sheets
│   │   └── main.jsx       # Entry point
│   ├── index.html         # Main entry page
│   └── package.json
│
└── README.md              # Documentation
```

---

## ⚙️ Installation & Setup

### **Prerequisites**
- Install **Node.js** (v16.x or newer)
- Obtain a **Google Gemini API Key** (optional, for voice transcription & AI diagnostics features)

### **Step 1: Clone and Configure the Backend**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   JWT_SECRET=your_custom_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

### **Step 2: Configure and Start the Frontend**
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL (usually `http://localhost:5173`) in your web browser.

---

## 🎯 How to Use

1. **Sign Up & Log In**:
   - Register as a **Customer** or a **Service Provider**.
2. **As a Customer**:
   - Click **Book Service** to create a job request. You can type the description or upload an audio voice note for automatic AI analysis.
   - Watch the active matching search and track your assigned provider moving towards your location on the map.
   - Use the live chat dashboard to negotiate prices and approve any spare parts invoices sent by the provider.
3. **As a Provider**:
   - Log in to your **Active Console**.
   - Toggle your status to **Available** to start receiving jobs on the map.
   - Accept matching requests, chat with clients, send parts requests, and click **Complete Job** to earn XP and level up!
4. **Developer Mode (Simulation)**:
   - Use the floating **Simulation Panel** to spawn virtual providers on the map, trigger drifts, and observe the live matching system in action.
