# Interactive Beach Tourism & Safety Information Portal

A full-stack, real-time dual-sided web platform designed for beachgoers (tourists) and beach authorities (lifeguards, safety officers, and administrators).

---

## 🌟 Key Features

### 🏖️ 1. Tourist / Public Side
- **Beach Search & Selection**: Seamlessly switch between beaches (Bondi Beach, Miami South Beach, Waikiki Beach) with localized real-time data.
- **Live Beach Safety Dashboard**:
  - Real-time **Beach Safety Flag** status (`Green`, `Yellow`, `Red`, `Double Red`, `Purple`) with clear patron guidance.
  - **Live Weather & Marine Metrics** powered by **Open-Meteo Marine & Forecast API**: Air temperature, apparent temperature, UV Index with sunburn risk meter, Wind speed & direction compass, Wave height and swell period, Water temperature.
  - **Tide Forecast Widget**: Rising/Falling status, next high tide, next low tide, and current depth curve.
  - **Rip Current Danger Index**: Real-time energy index calculated from swell height and period.
- **Interactive Beach Map**:
  - Custom ocean-styled map with layers for **Rip Current Danger Zones**, **Jellyfish Swarms**, and **Submerged Rocks**.
  - Color-coded pins for **Lifeguard Towers**, **First Aid**, **Restrooms**, **Showers**, and **Parking**.
  - Clickable pins and zones opening safety advisories and operating hours.
  - **"Locate Me" GPS Auto-Detection**: Centers the map on the user's location.
- **Priority Emergency SOS & Hazard Reporting**:
  - One-tap SOS emergency trigger.
  - Category selection: Swimmer in Distress (SOS), Rip Current, Jellyfish / Marine Pests, First Aid, Missing Person.
  - GPS coordinate capture and landmark description.
  - Camera / photo attachment support.
  - Anonymous or contact-verified reporting.
  - Generates a tracking ID and dispatches immediately to the Lifeguard Queue.
- **Crowd-Sourced Reports & Visitor Reviews**:
  - Live crowd tips ("Jellyfish spotted near rocks", "High tide covering shore").
  - Star ratings, cleanliness ratings, and crowd density indicators.

### 🛡️ 2. Lifeguard & Beach Authority Admin Side
- **Command Operations Center**:
  - Top command bar with shift info, officer badge, and active station selector.
  - Audio alert buzzer on incoming SOS reports.
  - Real-time incident counts, active hazard counts, and resolution metrics.
- **Live Safety Flag Controller**:
  - Instantly switch beach flag status (`Green`, `Yellow`, `Red`, `Double Red`, `Purple`) with single-click public synchronization.
- **Real-Time Incident Dispatch Console**:
  - Live incoming incident queue.
  - Status progression workflow: `New` ➔ `Acknowledged` ➔ `Responding` ➔ `Resolved`.
  - Detailed incident cards with GPS coordinates, phone callback links, and attached photos.
  - Lifeguard resolution logging.
- **Interactive Hazard Zone Creator**:
  - Click-to-draw hazard zone placement directly on the beach map canvas.
  - Set hazard type (Rip current, Jellyfish, Rocks), severity, and advisory notes.
  - Real-time deletion and zone toggling.
- **Public Safety Advisory Broadcaster**:
  - Studio to draft and broadcast urgent alerts (Title, Category, Severity, Auto-expiry).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v3, Vite, Lucide React, Zustand.
- **Backend & Cloud**:
  - Firebase Authentication (Role-Based Access Control)
  - Cloud Firestore (Real-time synchronization)
  - Firebase Storage (Incident attachments)
  - Cloud Functions (Scheduled weather cache sync & incident alerts)
- **APIs**:
  - Open-Meteo Marine & Forecast APIs (Live sea conditions, wind, UV, swells)
  - Google Maps JavaScript API (@react-google-maps/api)
  - HTML5 Geolocation API

---

## 🚀 Getting Started

### 1. Installation
```bash
cd beach-safety-portal
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Dual-Mode Operation
- **Out-of-the-Box Mode (Zero Configuration Required)**:
  The portal includes a reactive local storage engine with cross-tab event synchronization (`BroadcastChannel`). You can open two browser windows side-by-side:
  - Window 1: **Tourist View**
  - Window 2: **Lifeguard Admin View**
  Submitting an SOS in Window 1 will instantly ring the chime and pop up on the Lifeguard Dispatch in Window 2! Changing the flag in Window 2 will immediately update Window 1 in real time.
- **Firebase & Google Maps Live Cloud Mode**:
  Copy `.env.example` to `.env` and fill in your Firebase project keys and Google Maps API key.

---

## 🧪 Build & Production
```bash
npm run build
```
Creates an optimized production bundle in `/dist`.
