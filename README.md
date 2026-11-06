# KrishiMitra (ಕೃಷಿಮಿತ್ರ) – Smart Farming Assistant 🌱🌾

> An AI-powered, farmer-centric progressive web application designed to empower Indian agriculture with smart crop recommendations, real-time plant disease detection, dynamic weather insights, voice interaction, multilingual support, offline storage, farmer profile & record management, and an agronomy reminder calendar.

---

## 🌟 Key Features

1. **Multilingual Interface (ಕನ್ನಡ, English, हिन्दी)**:
   - Built-in language switcher with persistent user preferences in `LocalStorage`.
   - Default language: **Kannada (ಕನ್ನಡ)** with authentic agronomy terminology.
   - Comprehensive translations across navigation, dashboards, advisory tips, disease remedies, and chatbot responses.

2. **AI-Based Crop Recommendation**:
   - Location, soil type, soil pH, water availability, temperature, rainfall, and land size inputs.
   - Interactive recommendation cards displaying crop season, water requirement, duration, and farming tips.

3. **Plant Disease Detection & Camera Scanner**:
   - Dual-mode image capture: **Live Rear/Front Camera preview** (using MediaDevices API) and **Photo Gallery Upload** (JPG, PNG).
   - High-confidence demo diagnostics identifying disease symptoms, biological treatments, and preventive measures.

4. **AI Farming Assistant Chatbot with Voice Interaction**:
   - Speech-to-Text input using browser Web Speech API with microphone control.
   - Text-to-Speech audio output reading advice aloud in Kannada, English, or Hindi.
   - Suggested farmer questions and 24/7 guided agricultural knowledge.

5. **Farmer Data Management System (IndexedDB Protected)**:
   - **Farmer Profile**: Personal details, mobile, village, district, state, and farm details (land size, soil type, irrigation source, active crops).
   - **My Farming Records**: Organized Card View and Table View for crop logs, acres cultivated, and uploaded photo records.
   - **Data Portability**: Full JSON and CSV export/import capabilities.
   - **Decoupled Architecture**: Reusable storage abstraction layer (`farmerDataService.js`) ready for REST/GraphQL backend integration.

6. **Smart Farming Calendar & Reminders**:
   - Crop schedule generator with agronomic templates (Wheat, Chickpea, Basmati Rice, Tomato).
   - 6-Stage visual crop growth timeline (Germination, Vegetative, Tillering, Heading, Grain Filling, Maturity).
   - Reminders for **Irrigation**, **Fertilizer**, **Pest Scouting**, and **Crop Inspection**.
   - Native Web Browser Notifications API support.
   - Export payloads prepared for future server-side scheduled push/SMS/WhatsApp notifications.

7. **Progressive Web App (PWA) & Offline Access**:
   - Web App Manifest (`manifest.webmanifest`) and Service Worker (`sw.js`).
   - Static asset caching and locally cached agricultural emergency guide.
   - Offline status banner with simulated offline toggle for demonstrations.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18, Vite 6
- **Styling**: Tailwind CSS, Lucide Icons
- **Local Storage Engine**: IndexedDB (via native wrapper) & LocalStorage (for UI preferences)
- **Browser APIs**: MediaDevices API (Camera), Web Speech Recognition & Synthesis, Web Notification API, Service Worker API
- **Maps**: Google Maps JavaScript API with interactive Canvas fallback simulator

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mallappadodli93-rgb/krishitmitra.git

# Navigate to project folder
cd krishitmitra

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be live at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

The compiled static assets will be generated in the `dist/` directory.

---

## 📄 License

This project is created for the empowerment of Indian farmers and agricultural communities.
