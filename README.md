# MediCube

MediCube is a low-cost, AI-powered smart auto-dispenser and prescription support system designed to empower elderly individuals living independently or in low-income households while providing caregivers with an accessible, real-time medication management platform.

---

## Overview

Many elderly users struggle with maintaining proper medication routines—they might forget doses, mix up medications, or simply lose track of their schedules. At the same time, caregivers (family, neighbors, or part-time aides) often cannot be present at all times. MediCube addresses these challenges by combining an affordable, intuitive physical auto-dispenser with a robust, caregiver-accessible website. This integrated system ensures that medications are dispensed accurately, reminders are clearly communicated, and any missed doses trigger timely alerts.

---

## Target Audience

- **Elderly Individuals:** Those living independently or in low-income households who are not in assisted living or retirement homes.
- **Caregivers:** Family members, neighbors, or part-time aides who help manage medications on an as-needed basis.

---

## The Problem

- **Medication Errors:** Elderly users may forget to take their medications, take incorrect doses, or get confused about their schedules.
- **Limited Caregiver Presence:** Caregivers are not always available to supervise or assist with daily medication routines.
- **Inadequate Traditional Solutions:** Standard pillboxes are too passive, while commercial auto-dispensers are often expensive and lack integration with personalized support or caregiver management.

---

## The MediCube Solution

MediCube delivers a dual-pronged solution:

1. **Smart Physical Device:**
   - **Auto-Dispenser System:** Uses simple motor rotation and divided compartments to automatically dispense pills into a tray at scheduled times.
   - **Intuitive Interface:** Features a screen with large fonts and intuitive icons, paired with tactile buttons.
   - **Text-to-Speech Reminders:** Provides audible reminders (e.g., “It’s time to take 1 pill of Lisinopril”).
   - **Connectivity:** Syncs with the cloud (via Wi-Fi or Bluetooth) to update schedules and log medication events.
   - **Emergency Support:** Includes a caregiver ping button to alert a designated caregiver if help is needed.

2. **Integrated Web Platform:**
   - **Prescription Management Portal:**
     - Add/Edit medications with details like name, dosage, and frequency.
     - Create personalized dosage schedules using an interactive drag-and-drop calendar or time picker.
   - **Caregiver Dashboard:**
     - Monitor medication dispensation events in real time.
     - Receive alerts when a scheduled dose is missed or if the device isn’t accessed.
   - **AI-Powered Support:**
     - Input symptoms to get medication recommendations or questions to ask a doctor.
     - Access a voice-enabled chatbot that explains prescriptions in simple terms, tailored to both elderly users and their caregivers.
   - **3D Model Viewer:** Helps caregivers visually confirm the correct pill types.

---

## System Architecture

- **Real-Time Data Sync:** 
  - Utilizes cloud platforms (Firebase or Supabase) to maintain an up-to-date schedule between the device and the web portal.
  - When caregivers update medication schedules or add new prescriptions, the device reflects these changes immediately.
- **Event Logging & Alerts:**
  - Every dispensed dose is logged, and missed doses trigger notifications to ensure prompt intervention.

---

## Tech Stack Suggestions

### Website
- **Frontend:** React.js or Vue.js with Tailwind CSS for responsive, modern design.
- **Backend:** Firebase Functions or Express.js.
- **Database:** Firestore or Supabase.
- **AI Chatbot:** OpenAI or Google Gemini API.
- **3D Viewer:** Three.js or Web Component-based Model Viewer.

### Physical Device
- **Controller:** Raspberry Pi Zero or ESP32.
- **Display:** LCD, LED Matrix, or E-Ink (for energy efficiency).
- **Actuators:** Servo motors for pill compartment rotation.
- **Voice Output:** Google TTS or Polly API.
- **Connectivity:** Wi-Fi module for real-time data syncing.

---

## Demo Scenario

For a hackathon demonstration, the following scenario could be showcased:
- A caregiver logs into the website, adds a new medication, and sets up a personalized dosage schedule.
- The MediCube device automatically updates its schedule, rotates its compartments, and dispenses the pill at the scheduled time.
- The device audibly announces the medication, and the event is logged and displayed live on the caregiver dashboard.
- In case of a missed dose, the system sends an immediate alert to the caregiver.

---

## Why MediCube Matters

- **Affordability:** Designed with cost-cutting measures by leveraging open-source hardware and DIY components.
- **Empowerment:** Supports independent living for the elderly by ensuring reliable, timely medication management.
- **Connected Care:** Provides caregivers with peace of mind through real-time monitoring and alert systems.
- **Innovation:** Combines AI, smart hardware, and an intuitive web interface to offer a holistic and integrated medication management solution.

---

## Contributing

We welcome contributions to enhance MediCube’s features and expand its capabilities. Please refer to our contribution guidelines and code of conduct in the project repository for more details.

---

For further information, inquiries, or to contribute, please visit our project repository or contact the development team.
