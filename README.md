# Examly - Modern School Examination Management Platform

A responsive, production-ready examination management platform built with React 19, TypeScript, Vite, and KaTeX. Examly bridges classroom assessment, live exam proctoring, synchronized timing, and student outcome analytics.

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
  - Student profile grade level preserved as primary truth.
  - Immediate real-time ejection if a student is removed during an active exam.
- **Automated Grading & Analytics**:
  - Regrade student submissions with instant score recalibration.
  - Individual student evaluation breakdown with dedicated "Questions Missed" side-by-side analysis and question explanations.
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
- **Submission Receipts**: Instant confirmation and grade reports when results are released.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation & Run

```bash
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
- **Framework**: React 19, TypeScript
- **Bundler & Tooling**: Vite 8, Rolldown
- **Icons**: Lucide React
- **Math & LaTeX Rendering**: KaTeX
- **Persistence**: Browser storage service with activity logging and event synchronization

---

## 📄 License
MIT License.
