# 🏗️ ZanatFlow — Technical Architecture & System Design

This document details the architectural design, component hierarchy, data models, and integration patterns powering **ZanatFlow**.

---

## 🏛️ System Overview

ZanatFlow is structured as a full-stack Web Application running a React SPA on Vite with an Express proxy server for API endpoints and background tasks.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT SIDE                               │
│  ┌───────────────────────┐   ┌───────────────────┐   ┌──────────────┐  │
│  │   React 19 SPA UI     │   │ DataContext Hooks │   │ LocalStorage │  │
│  │ (Kanban, Maps, Charts)│──▶│ (CRUD & Sync)     │──▶│ Offline Mode │  │
│  └───────────────────────┘   └─────────┬─────────┘   └──────────────┘  │
└────────────────────────────────────────┼───────────────────────────────┘
                                         │ (Realtime Sync & REST)
┌────────────────────────────────────────▼───────────────────────────────┐
│                           SERVICES & BACKEND                           │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│  │ Firebase Firestore   │  │ Express Proxy       │  │ Google Places  │ │
│  │ (Auth & NoSQL DB)    │  │ (Node.js / TS Server│  │ & Gemini AI    │ │
│  └──────────────────────┘  └─────────────────────┘  └────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```text
ZanatFlow/
├── public/                 # Static public assets
├── src/
│   ├── components/
│   │   ├── drawers/        # Slide-over detail panels (LeadDrawer)
│   │   ├── modals/         # CRUD dialogs (LeadModal, ClientModal, ProjectModal, etc.)
│   │   ├── views/          # Primary application routes & screens
│   │   │   ├── AISalesAgentView.tsx   # AI Cold Email & Outreach Generator
│   │   │   ├── LeadFinderView.tsx     # Google Places Discovery & Audit Engine
│   │   │   ├── DashboardView.tsx      # Executive Metrics & Overview
│   │   │   ├── AnalyticsView.tsx      # Recharts Analytics & Conversion Funnels
│   │   │   ├── LeadsView.tsx          # Kanban & Table Lead Management
│   │   │   ├── ClientsView.tsx        # Client Profiles & Conversion
│   │   │   ├── ProjectsView.tsx       # Project Milestone Tracker
│   │   │   ├── FinancesView.tsx       # Cash Flow & Invoicing
│   │   │   └── SettingsView.tsx       # User Preferences & API Key Setup
│   │   ├── Header.tsx      # Top Navigation Bar
│   │   └── Sidebar.tsx     # Collapsible Sidebar Navigation
│   ├── context/
│   │   └── DataContext.tsx # Centralized State Management & Data Provider
│   ├── services/
│   │   ├── firebase.ts            # Firebase SDK Initializer & Auth/Firestore API
│   │   ├── googlePlacesService.ts # Google Places API (New) & Audit Analyzer
│   │   └── mockData.ts            # Initial Mock Dataset & Guest Mode Seed
│   ├── types/
│   │   └── index.ts        # TypeScript Interfaces & Domain Models
│   ├── utils/
│   │   └── formatters.ts   # Currency, Date, and Status Badge Helpers
│   ├── App.tsx             # Root Application Shell
│   └── main.tsx            # Application Entry Point
├── server.ts               # Express Backend Proxy Server
├── firebase-blueprint.json # Firestore Schema & Blueprint Representation
├── firestore.rules         # Security Rules Enforcement
├── metadata.json           # Application Metadata
└── README.md               # Overview & Setup Guide
```

---

## 🔄 Core Workflows

### 1. Lead Discovery & Audit Algorithm (`googlePlacesService.ts`)
1. User searches target City, Country, and Industry Categories.
2. System triggers Google Places API (`v1/places:searchText`) or REST fallback.
3. For each retrieved place, `analyzePlaceWebPresence()` runs:
   - Verifies website presence (`NO_WEBSITE` score: +40).
   - Checks domain status and free subdomains (`Wix`, `WordPress`, `Facebook` score: +25).
   - Verifies SSL status (`HTTP` vs `HTTPS` score: +15).
   - Evaluates Google Rating & Review total (Active business score: +10).
4. Calculates final **Lead Score (0–100)** and suggests a category-specific sales proposal.

### 2. Gemini AI Sales Pitch Generation (`AISalesAgentView.tsx`)
1. User selects a lead or inputs custom client pain points.
2. Formats a structured prompt containing lead industry, current website quality, deal estimate, and identified weaknesses.
3. Calls `@google/genai` SDK (`gemini-2.5-flash` model).
4. Generates multi-channel outreach options (Email, WhatsApp message, LinkedIn pitch, Phone call pitch).

### 3. Data Synchronization & Persistence (`DataContext.tsx`)
- If Firebase Auth is authenticated: Reads/writes directly to Firebase Cloud Firestore collections (`leads`, `clients`, `projects`, `tasks`, `finances`, `services`).
- If in Guest / Offline Mode: Persists changes instantly to browser `localStorage` with seed fallback.

---

## 🔒 Security Architecture

- **Data Privacy**: Firestore security rules restrict user read/write access strictly to `request.auth.uid == resource.data.userId`.
- **API Protection**: Client keys are configurable via UI secrets or isolated server variables.
