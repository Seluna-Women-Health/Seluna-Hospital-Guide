# 📝 Product Requirements Document: Women's Health Symptom Navigator

## Overview
A web-based application to guide women through symptom checking, pain visualization, and simulate a gynecological clinic visit experience with compassion and clarity. 

---

## 🔧 Technical Stack
- **Frontend**: React (with TailwindCSS or similar for styling)
- **Backend**: Python (FastAPI preferred for async capability)
- **Voice**: Web Speech API / Whisper API
- **Visualization**: Canvas or SVG-based interactive body diagram
- **Hosting**: Vercel (frontend) + Render or similar (backend)

---

## 📌 Functional Sections & Screens

### 🔹 Section 1: Landing Page

**Screen 1: Home / Entry**
- App name + tagline
- CTA: `Start Symptom Check`
- Secondary CTA: `Real-life Hospital Visit Guide`
- Language dropdown (EN/中文/ES/...)
- Optional: Login to save report (OAuth / cookie session)

---

### 🔹 Section 2: Voice Symptom Checker

#### Screen 2A: Symptom Input (Left Pane)
- Chat-style interface with mic input
- Real-time voice-to-text, chatbot replies (text-to-speech)
- Prompt flow:
  - Where is the pain?
  - Describe the pain (sharp, dull, stabbing...)
  - Other symptoms?
- Backend model: simple rule-based triage or LLM light-weight intent classifier

#### Screen 2B: Visualization (Right Pane)
- Female body SVG + glowing pain areas
- Users can tap to highlight zones
- Pain intensity slider (0–10)
- Emotion emoji picker

---

### Screen 3: Symptom Summary & Triage Result
- Summary cards:
  - Affected areas + severity
  - Pain type chips (e.g., "Throbbing")
  - Additional symptoms
- Recommendation card:
  - 🟢 Rest
  - 🟡 Monitor
  - 🔴 Seek care
- Downloadable summary PDF
- CTA:
  - `Prepare for Visit`
  - `Download Report`

---

### Screen 4: Additional Details
- Pain type & severity dropdowns
- Chips for:
  - Heavy bleeding
  - Nausea, chills, etc.
  - Pain during sex/urination
  - Emotional symptoms

---

### Screen 5: Cultural View (Optional)
- Toggle to view in traditional medicine language
- Ask about:
  - Herbal remedies
  - Cultural beliefs / stigma

---

### 🔹 Section 3: Hospital Visit Simulation

**Screens 6–15: Step-by-step Simulation**
Each screen includes:
- Cartoon-style illustrations or animations
- Voiceover (optional)
- Headline + gentle description
- Tips or emotional support text

**Simulation Steps:**
1. Arriving at Clinic
2. Check-In Process
3. Nurse Intake
4. Changing Clothes
5. Waiting Room
6. Doctor Enters
7. Blood test
8. Pelvic Exam (optional, skippable)
9. Test Results
10. Pharmacy Info
11. What to Bring
12. Closing Encouragement

---

### 🔹 Section 4: Post-Visit & Educational Resources

**Screen 16: Check-in Feedback**
- Ask: "Did you go to the doctor?"
- Emoji scale for: "Did you feel heard?"
- CTA: `Set Reminder for Follow-up`

**Screen 17: Resources Hub**
- Cards/articles:
  - "Is it normal to have cramps this bad?"
  - "What is PCOS?"
  - "Your rights as a patient"
- Culturally filtered content (tags)
- Toggle for language / beliefs

---

## 🧩 Persistent UI Components
- 🌍 Language toggle (top right)
- 💬 Chatbot help / FAQ widget
- 🔐 Privacy & Safe Browsing statement
- 🛑 Emergency Quick Exit Button
- 🧸 Soft UI: warm tones, rounded edges, emoji-friendly icons

---

## 🧪 API & Backend Requirements
- FastAPI endpoints:
  - `/speech-to-text`
  - `/text-to-speech`
  - `/symptom-analysis`
  - `/generate-report`
  - `/get-resource-cards`
- Static content: Illustrations, audio files
- Privacy-preserving session storage (no PII unless opted in)

---

## ✅ MVP Goals
- Flow: Landing → Voice input → Visualization → Summary → Simulation
- React frontend with routing per screen
- FastAPI backend with symptom logic
- Basic pain visualization and symptom recording
- Downloadable report (PDF or text)

---

## 🔮 Future Ideas
- LLM-enhanced symptom understanding
- Calendar tracker integration
- Real clinic matching / booking
- Embeddable export for other healthcare orgs
