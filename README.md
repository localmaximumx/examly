# Examly - Modern School Examination Management Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-examly--three--sigma.vercel.app-success?style=for-the-badge&logo=vercel)](https://examly-three-sigma.vercel.app)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Production%20Ready-blue?style=for-the-badge&logo=vercel)](https://examly-three-sigma.vercel.app)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

> **Live Application URL**: 🌐 [https://examly-three-sigma.vercel.app](https://examly-three-sigma.vercel.app)

A responsive, production-ready examination management and assessment platform built with React 19, TypeScript, Vite, Supabase, and KaTeX. Examly bridges classroom assessment, live exam proctoring, synchronized timing, and student outcome analytics.

---

## 🌐 Live Access Portals

| Portal | Direct Link | Description |
| :--- | :--- | :--- |
| **🚀 Main Web App** | [examly-three-sigma.vercel.app](https://examly-three-sigma.vercel.app) | Landing page & gateway |
| **👨‍🏫 Teacher Portal** | [examly-three-sigma.vercel.app/login/teacher](https://examly-three-sigma.vercel.app/login/teacher) | Examination creation, live monitoring, grading & classrooms |
| **🎓 Student Portal** | [examly-three-sigma.vercel.app/login/student](https://examly-three-sigma.vercel.app/login/student) | Active examinations, real-time tests, and results analysis |

---

## 🌟 Key Features

### 👨‍🏫 Teacher Workspace
- **Examination Management**: Create, edit, and organize exams with LaTeX equation support.
- **Live Exam Monitoring**:
  - Real-time synchronized master countdown clock.
  - Controls for pause/resume timer and instant +10m extensions.
  - Dynamic active in-session attendance and submitted tracker.
  - Student admission lobby with one-click approval workflows.
- **Classroom Cohort Management**:
  - Multi-class assignment per examination.
  - Enrollment by Student ID search or bulk ID pasting.
  - Quick classroom deletion with automatic student cohort unassignment and cloud cleanup.
  - Student profile grade level preserved as primary truth.
  - Immediate real-time ejection if a student is removed during an active exam.
- **Automated Grading & Detailed Analysis**:
  - Auto-grading of Multiple Choice & True/False questions upon submission.
  - Individual student evaluation breakdown with dedicated "Questions Missed" side-by-side analysis, official answer keys, and question explanations.
  - Regrade student submissions with instant score recalibration.
  - Filtered CSV exports (class-scoped or comprehensive) strictly restricted to completed exams.
- **Hierarchical Breadcrumb Navigation**:
  - Seamless 4-level deep navigation tree with context retention:
    `Workspace / Examinations / {Exam Title} / Results & Performance / {Classroom} / {Student}`.

### 🎓 Student Portal
- **Examination Hub**: View eligible assigned exams (unassigned exams are safely hidden).
- **Proctored Exam Experience**:
  - Synchronized real-time official exam timer.
  - Auto-ejection with warning prompt if student access is revoked.
  - Interactive multiple choice and true/false answering with KaTeX mathematical typography.
- **Result & History Breakdown**:
  - Instant confirmation receipts upon submission.
  - Complete parity with teacher grading view: toggle between "Missed only" and "All questions".
  - Question-by-question review with student choices, official answer keys, and detailed explanations.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/localmaximumx/examly.git
cd examly

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be running locally at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

---

## 🛠️ Tech Stack
- **Hosting & Edge Delivery**: [Vercel](https://vercel.com)
- **Database & Cloud Sync**: [Supabase](https://supabase.com)
- **Framework**: React 19, TypeScript
- **Bundler & Tooling**: Vite 8, Rolldown
- **Icons**: Lucide React
- **Math & LaTeX Rendering**: KaTeX
- **Persistence**: Hybrid offline-first local storage synced with Supabase Postgres

---

## 📄 License
MIT License.
