# HealthAI — AI-Based Health Assistant

HealthAI is a web app that helps users:

- analyze symptoms with AI-generated risk guidance,
- chat with an AI health assistant,
- access a supportive mental-wellness chat + breathing exercise,
- store and review their personal health interactions securely.

Important: this project provides informational guidance only and is **not** a medical diagnosis tool.

## Hackathon Pitch

HealthAI is a Gemini-powered health companion that turns plain-language symptom descriptions into practical next steps. Users sign in with Firebase Authentication, describe symptoms via text or voice, and instantly receive a risk level, likely conditions, and urgency guidance. A built-in chatbot answers follow‑up questions, and a separate mental‑wellness mode offers supportive, non‑judgmental conversation plus a breathing exercise. All analyses and chats are stored per-user in Firestore, enabling users to revisit their history and track patterns. An Emergency screen surfaces nearby hospitals using a Google Maps embed and includes an SOS trigger (demo). The MVP prioritizes speed, accessibility, and privacy-conscious personalization.

## Problem Statement

People often struggle to interpret symptoms quickly and safely, which can delay appropriate care. HealthAI provides fast, easy-to-use, AI-assisted triage-style guidance and a private history so users can track what they asked and what advice they received.

## Core Features (Implemented)

### Authentication (Firebase)

- Email/password signup + login
- Google Sign-In
- Protected routes (app requires login)

### Symptom Analyzer (Gemini)

- Enter symptoms (typed or voice-to-text) and receive:
  - risk level (Low/Medium/High)
  - possible conditions (list)
  - advice and urgency guidance
- Saves symptom analyses to Firestore per user

### AI Chatbot (Gemini)

- General health Q&A chat experience
- Loads and saves chat history to Firestore per user

### Mental Wellness Mode

- Separate “supportive friend” chat experience
- Saves/loads mental-wellness chat history separately from general chat
- Built-in breathing exercise overlay

### Emergency Page

- “SOS” UI trigger (demo only)
- Nearby hospitals map via Google Maps embed

### History

- View symptom analysis history
- View chatbot history + mental-wellness history

### Analytics

- Analytics screen uses **mock data** (not connected to Firestore)

## Tech Stack

- Frontend: React + Vite + React Router
- UI/UX: Framer Motion, lucide-react
- Auth + Database: Firebase Authentication, Firestore
- AI: Gemini API via `@google/generative-ai`

## Google Technologies Used

- Gemini API (Generative Language)
- Firebase Authentication
- Firebase Firestore
- Google Sign-In (via Firebase provider)
- Google Maps embed (iframe)

## AI Workflow (High-level)

### Symptom Analyzer

1. User enters symptoms (query param `q`).
2. Frontend calls Gemini with a prompt that requests a structured JSON response.
3. UI parses JSON (or falls back to a best-effort text interpretation).
4. Results are shown and saved to Firestore (`symptomAnalysis`) for the logged-in user.

### Chatbot / Mental Wellness

1. User sends a message.
2. Frontend builds context from previous messages.
3. Gemini generates a response.
4. Both user and assistant messages are saved to Firestore (`chats`) with a `context` field (`chat` or `mental`).

## Project Structure

```
src/
	components/         Navbar, ProtectedRoute
	contexts/           AuthContext (Firebase Auth)
	firebase/           Firebase initialization
	hooks/              useVoice (browser speech APIs)
	pages/              Home, SymptomAnalyzer, Chatbot, MentalHealth, Emergency, History, Analytics
	services/           gemini (AI calls), chatService (Firestore persistence)
```

## Running Locally

### Prerequisites

- Node.js (recent LTS recommended)
- A Firebase project (Auth + Firestore enabled)
- A Gemini API key

### 1) Install

```bash
npm install
```

### 2) Configure Environment Variables

Copy `.env.example` to `.env` and fill in values.

Required variables:

| Variable                            | Purpose                             |
| ----------------------------------- | ----------------------------------- |
| `VITE_GEMINI_API_KEY`               | Gemini API key used by the frontend |
| `VITE_FIREBASE_API_KEY`             | Firebase web app config             |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase web app config             |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase web app config             |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase web app config             |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app config             |
| `VITE_FIREBASE_APP_ID`              | Firebase web app config             |

Note: `VITE_MEASUREMENT_ID` is referenced in code; add it only if you use Firebase Analytics.

### 3) Enable Firebase Authentication

In Firebase Console:

- Authentication → Sign-in method → enable **Email/Password**
- Enable **Google** provider

### 4) Enable Firestore

In Firebase Console:

- Firestore Database → Create database

### 5) Start the App

```bash
npm run dev
```

## Demo Flow (for judges)

1. Sign up / sign in (Email/Password or Google).
2. Home → enter symptoms (or use the mic in supported browsers).
3. Review Symptom Analysis (risk level + advice) and open History.
4. Chatbot → ask follow-up questions; refresh and confirm history loads.
5. Mental Wellness → try supportive chat and open the Breathing Exercise.
6. Emergency → view nearby hospitals and test the SOS UI trigger (demo).

## Safety, Privacy, and Limitations

- The app shows a disclaimer that AI output is not a diagnosis.
- Mental wellness mode instructs the AI (via prompt) to avoid diagnoses and keep responses brief.
- Data is stored per-user in Firestore (chats + symptom analyses).

Not implemented yet (important limitations):

- **No backend proxy**: Gemini API key is used from the client. This is okay for a hackathon demo but not safe for production.
- Emergency SOS is a **demo UI** (no SMS/calling/contacts integration).
- Analytics page is **mock** and not based on stored data.

## Data Model (Firestore)

- `chats`
  - `userId` (string)
  - `message` (string)
  - `role` (`user` | `assistant`)
  - `context` (`chat` | `mental`)
  - `timestamp` (serverTimestamp)
  - `createdAt` (ISO string)
- `symptomAnalysis`
  - `userId` (string)
  - `symptoms` (string)
  - `analysis` (object; includes `riskLevel`, `conditions`, `advice`, `urgency`)
  - `timestamp` (serverTimestamp)
  - `createdAt` (ISO string)

## Roadmap (Future Scope)

- Move Gemini calls to a secure backend (e.g., Cloud Functions) to protect keys
- Add stronger safety guardrails (moderation, crisis escalation guidance, policy filters)
- Real “nearby doctors” lookup (e.g., Places API + geolocation)
- Real analytics using Firestore data
- Firestore Security Rules + data deletion/export controls

## License

Not specified in this repository.

## PPT One-liners (copy/paste)

- “Gemini-powered symptom risk triage in seconds.”
- “Firebase Auth + Firestore enable private, personalized health history.”
- “Two assistants: medical Q&A + mental wellness support.”
- “Voice input + read-aloud for accessibility (browser-based).”
- “Emergency-ready UX with nearby hospitals via Google Maps embed.”
