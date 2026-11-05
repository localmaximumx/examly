# Examly — Digital Examination Platform for Ethiopian High Schools

[![Live Demo](https://img.shields.io/badge/Live%20Demo-examly--three--sigma.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://examly-three-sigma.vercel.app)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Production%20Ready-6366f1?style=for-the-badge&logo=vercel)](https://examly-three-sigma.vercel.app)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Cloud-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)

> 🌍 **Live Application**: [https://examly-three-sigma.vercel.app](https://examly-three-sigma.vercel.app)  
> 🇪🇹 **Mission**: Eliminating paper costs, printing delays, and administrative overhead across Ethiopian secondary and preparatory high schools through secure, offline-first digital assessments.

---

## 🎯 The Mission: Transforming High School Assessment in Ethiopia

Across Ethiopian secondary and preparatory schools (Grades 9 through 12), paper-based examinations present an enormous recurring financial and logistical challenge:

* 💸 **Skyrocketing Printing & Paper Costs**: Every mid-term, final, and model exam cycle requires tens of thousands of printed exam sheets per school. With volatile paper prices and supply shortages, schools spend millions of Birr annually on paper and ink alone.
* 📦 **Distribution Bottlenecks & Security Risks**: Transporting, storing, and securing physical question papers creates constant logistical strain and vulnerabilities to premature leaks.
* ⏳ **Manual Grading Delays & Grading Fatigue**: Instructors spend weeks hand-marking paper answer sheets, causing delayed report cards and human error in tallying marks.
* 🗑️ **Stationery Waste**: Once administered, single-use exam papers are discarded, generating unnecessary environmental waste.

**Examly solves this directly.** By providing an intuitive, lightweight, offline-resilient digital testing environment, schools can conduct exams completely paperless on school computer labs, laptops, or tablets—saving funds that can be reinvested into textbooks, lab equipment, and student facilities.

---

## 🌐 Live Access Portals

| Portal | URL | Primary Function |
| :--- | :--- | :--- |
| **🚀 Landing & Gateway** | [examly-three-sigma.vercel.app](https://examly-three-sigma.vercel.app) | Platform entry point and account selection |
| **👨‍🏫 Teacher Workspace** | [examly-three-sigma.vercel.app/login/teacher](https://examly-three-sigma.vercel.app/login/teacher) | Exam authoring, live proctoring, cohort assignment, and analytics |
| **🎓 Student Portal** | [examly-three-sigma.vercel.app/login/student](https://examly-three-sigma.vercel.app/login/student) | Active exam lobby, timed exam-taking, and detailed score breakdown |

---

## 🌟 Key Features

### 👨‍🏫 Teacher Workspace
* **Paperless Exam Authoring**: Create Multiple Choice and True/False questions with comprehensive mathematical formatting (LaTeX / KaTeX), diagrams, and detailed rationale explanations.
* **Synchronized Live Proctoring**:
  * Unified countdown timer synchronized across all student devices.
  * Teacher controls to pause, resume, or extend the timer (+10 min) on the fly.
  * Real-time attendance monitor: view connected students, in-progress attempts, and completed submissions.
  * Student admission lobby with one-click approval workflows.
* **Classroom & Cohort Management**:
  * Organize students by Grade Level and Section (e.g., Grade 10A, Grade 12C).
  * Enroll students by unique ID search or bulk ID pasting.
  * Delete classrooms with clean cohort re-assignment and cloud synchronization.
  * Instant auto-ejection from live exams if student access is revoked.
* **Instant Automated Grading & Deep Analytics**:
  * Real-time evaluation against official answer keys immediately upon submission.
  * Side-by-side comparison: view each student's exact choice vs. the official answer key.
  * Dedicated **"Missed Only"** filter to pinpoint learning gaps across the cohort.
  * Filtered CSV exports (class-scoped or comprehensive) for official school record-keeping.

### 🎓 Student Portal
* **Clean Exam Lobby**: Only see exams assigned to your enrolled section; unauthorized exams remain protected.
* **Focused Exam Taking Experience**:
  * Synchronized timer with clear countdown warnings.
  * Mathematical equations rendered via KaTeX (perfect for Physics, Chemistry, and Mathematics).
  * Auto-save answers with offline resilience.
* **Transparent Evaluation History**:
  * Full parity with teacher view: students inspect their own submitted choices, official keys, and explanations.
  * Filter between **"Missed only"** and **"All questions"**.
  * Instant official score confirmation receipts.

---

## 🏗️ Architecture & Offline-First Design

Ethiopian schools frequently face intermittent internet connectivity or power interruptions. Examly is architected with an **offline-first hybrid approach**:

```
[ Student & Teacher Browser / Local Lab ]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
 [ Local Persistence ]   [ Supabase Postgres ]
  - Instant zero-latency  - Cloud sync & backup
  - Full offline uptime   - Unified school data
  - Resilient sessions    - Cross-device recovery
```

1. **Zero-Latency Local Operation**: Exam timers, answering, and scoring run client-side without stalling if the internet drops during an active test.
2. **Cloud Synchronization**: User registrations, classroom cohorts, exams, and graded submissions automatically sync to Supabase Postgres whenever network access is available.
3. **Single Page Application Routing**: Configured with Vercel edge rewrite rules to ensure smooth, reload-safe navigation across all deep links.

---

## 🛠️ Tech Stack

* **Frontend Framework**: [React 19](https://react.dev) with [TypeScript](https://www.typescriptlang.org)
* **Build System**: [Vite 8](https://vitejs.dev)
* **Cloud Database**: [Supabase](https://supabase.com) (PostgreSQL)
* **Hosting & CDN**: [Vercel](https://vercel.com)
* **Mathematical Typography**: [KaTeX](https://katex.org) (LaTeX math equations)
* **Icons**: [Lucide React](https://lucide.dev)
* **Styling**: Modern dark-themed CSS design system optimized for school computer lab screens

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* `npm` or `yarn`

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/localmaximumx/examly.git
cd examly

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will be available locally at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

The production output will be generated inside the `dist/` directory.

---

## 📂 Project Structure

```
examly/
├── src/
│   ├── components/         # Shared UI components (Panels, Stats, Badges, LaTeX)
│   ├── context/            # Global AppContext (auth, active screen, navigation)
│   ├── data/               # Default academic seed configurations
│   ├── lib/                # Supabase client & offline-to-cloud synchronization
│   ├── pages/
│   │   ├── auth/           # Login & registration for students and teachers
│   │   ├── student/        # Student exam lobby, live exam screen, and results
│   │   └── teacher/        # Teacher dashboard, monitor, classes, and grading
│   ├── services/           # Business logic (auth, exams, grading, submissions)
│   ├── types/              # TypeScript domain types & interfaces
│   └── utils/              # CSV export utilities & date formatters
├── vercel.json             # Vercel deployment & SPA routing rules
├── vite.config.ts          # Vite build configuration
└── package.json            # Project manifest
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
