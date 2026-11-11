# 🚀 ZanatFlow — Freelance Business CRM & Automated Lead Finder

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

**ZanatFlow** is an all-in-one, high-performance Customer Relationship Management (CRM) platform and automated client acquisition engine built for freelancers, web developers, design agencies, and digital consultants.

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Firebase Firestore**, and **Google Gemini 2.5 Flash AI**, ZanatFlow streamlines the entire sales and project lifecycle: from automated local lead scraping and web audit scoring to AI-powered email pitch generation, pipeline management, project milestone tracking, and financial forecasting.

---

## 🔥 Key Features & Capabilities

### 1. 📍 Google Maps Lead Finder Engine
- **Automated Business Discovery**: Scrapes real local businesses in any target city and country using Google Places API (New REST v1 & SDK integration).
- **Web Presence Audit & Lead Scoring (0–100)**: Automatically inspects business websites, detecting missing sites (`NO_WEBSITE`), HTTP/SSL vulnerabilities, domain errors (`BROKEN_WEBSITE`), or outdated subdomains (`wixsite.com`, `wordpress.com`).
- **22+ Specialized Industry Categories**: Includes custom prospecting logic for Driving Schools, Law Firms, Accounting, Dental Clinics, Car Rentals, Wedding Venues, Carpentry, Towing Services, and more.
- **Automated Sales Pitch Recommendation**: Generates tailored service proposals based on industry requirements (e.g., online candidate enrollment for driving schools, 1-click SOS mobile CTA for towing services, direct fleet booking for car rentals).
- **Interactive Map & Grid Views**: Interactive Google Maps visualization with color-coded lead pins and instant bulk CRM import.

### 2. 🤖 Gemini AI Sales & Pitch Generator
- **AI-Powered Cold Outreach**: Uses `@google/genai` (Google Gemini 2.5 Flash) to analyze lead pain points and generate high-converting cold emails, WhatsApp messages, LinkedIn pitches, and sales call scripts.
- **Custom Tone & Offer Alignment**: Personalizes outreach scripts based on proposed solutions, estimated deal values, and business quality badges.

### 3. 📊 Visual CRM & Lead Pipeline
- **Dual Pipeline Views**: Interactive Kanban board and customizable Data Table views.
- **Stage Management**: Tracks leads through *New Lead*, *Researched*, *Contacted*, *In Negotiation*, *Proposal Sent*, *Won*, and *Lost*.
- **Deal Forecasting & Priority Filtering**: Weighted win probabilities, estimated deal values (BAM, EUR, USD), follow-up reminders, and activity history tracking.
- **CSV Data Operations**: Export leads/clients to CSV or bulk import leads from spreadsheets.

### 4. 📁 Client & Project Management
- **Seamless Lead-to-Client Conversion**: 1-click transformation of won deals into active client profiles.
- **Project Tracking & Milestones**: Monitor project status (*Planning*, *In Progress*, *Client Review*, *Completed*, *Maintenance*), agreed vs paid amounts, and deadlines.
- **Hosting & Domain Expiry Reminders**: Track domain registrars, hosting providers, renewal dates, deployment URLs, and admin credentials.

### 5. 💰 Finance Management & Service Catalog
- **Income & Expense Tracking**: Categorize payments, hosting expenses, software subscriptions, and equipment costs.
- **Net Revenue & Margin Metrics**: Real-time net income calculations and unpaid invoice alerts.
- **Service Catalog**: Manage reusable service packages (e.g., *Custom Landing Page*, *E-Commerce Store*, *SEO Package*, *Monthly Maintenance*) with base pricing and delivery estimates.

### 6. 📈 Executive Analytics & Reporting
- **Data Visualizations**: Built-in charts powered by **Recharts** displaying monthly revenue trends, pipeline conversion funnels, industry distributions, and lead source performance.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons |
| **State & Context** | React Context API, Custom Data Hooks, LocalStorage fallback |
| **Backend / Proxy** | Express.js on Node.js / `tsx` dev server |
| **Database & Auth** | Firebase Cloud Firestore, Firebase Authentication |
| **Geolocation & Maps** | `@vis.gl/react-google-maps`, Google Places API (New) |
| **Artificial Intelligence** | `@google/genai` (Google Gemini 2.5 Flash SDK) |
| **Data Visualization** | Recharts |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and `npm` or `bun`

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ZanatFlow.git
   cd ZanatFlow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"
   GEMINI_API_KEY="your_gemini_api_key_here"
   APP_URL="http://localhost:3000"
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🛡️ Security & Privacy
- Sensitive API keys are isolated server-side or injected via environment variables.
- Firebase Firestore Security Rules (`firestore.rules`) enforce user-level data isolation.
- Unauthenticated users can test the application in Guest Mode via local storage mock fallback.

---

## 👤 Author & Credits

**Ajdin Beganović**  
*Full-Stack Software Engineer*  
