# Examly — School Examination Management Web Application

**Examly** is a high-performance, browser-based School Examination Management Web Application designed for educational institutions to conduct examinations, manage student cohorts, monitor live sessions, grade student submissions, and generate institutional analytics.

---

## 1. Technology Stack

- **User Interface**: React 19 + TypeScript
- **Routing & Navigation**: React Router (`react-router-dom` v7)
- **Bundler & Build Tool**: Vite
- **Styling**: Modern Education SaaS CSS system with **Dark Mode by default** and typography scaling
- **Icons**: Lucide React
- **Data & Persistence**: Centralized `StorageService` using browser `localStorage` with domain service interfaces ready for future Supabase / Postgres integration.

---

## 2. Web Routes & Screen Mapping (All 26 Screens)

| # | Screen Name | Role | Direct Web URL Route |
|---|---|---|---|
| **1** | Teacher login | Teacher | `/login/teacher` |
| **2** | Teacher dashboard | Teacher | `/teacher/dashboard` |
| **3** | Examination list | Teacher | `/teacher/examinations` |
| **4** | Create exam – general information | Teacher | `/teacher/examinations/create/general` |
| **5** | Create exam – questions | Teacher | `/teacher/examinations/create/questions` |
| **6** | Create exam – settings | Teacher | `/teacher/examinations/create/settings` |
| **7** | Exam preview | Teacher | `/teacher/examinations/preview` |
| **8** | Exam details | Teacher | `/teacher/examinations/details` |
| **9** | Start examination confirmation | Teacher | `/teacher/examinations/start-confirmation` |
| **10** | Live monitoring | Teacher | `/teacher/monitoring` |
| **11** | Results dashboard | Teacher | `/teacher/results` |
| **12** | Individual result & grading | Teacher | `/teacher/grading` |
| **13** | Question bank | Teacher | `/teacher/question-bank` |
| **14** | Students & classes | Teacher | `/teacher/students` |
| **15** | Reports | Teacher | `/teacher/reports` |
| **16** | Settings | Teacher | `/teacher/settings` |
| **17** | Activity log | Teacher | `/teacher/activity-log` |
| **18** | Student login | Student | `/login/student` |
| **19** | Student home | Student | `/student/home` |
| **20** | Exam instructions | Student | `/student/exam/instructions` |
| **21** | Main examination | Student | `/student/exam/take` |
| **22** | Connection interruption | Student | `/student/exam/interrupted` |
| **23** | Submission confirmation | Student | `/student/exam/submit-confirmation` |
| **24** | Submission receipt | Student | `/student/exam/receipt` |
| **25** | Student examination history | Student | `/student/history` |
| **26** | Student result view | Student | `/student/results` |

---

## 3. Web Features

1. **Browser Navigation & URL Sync**:
   - Direct URL access to any of the 26 screens.
   - Page refresh (`F5`) maintains the active screen without losing routing state or exam progress.
   - Browser Back and Forward buttons navigate through application history naturally.
2. **Route Guard & Security**:
   - Students attempting to directly access teacher routes (`/teacher/*`) are safely redirected to `/student/home` with a warning toast.
3. **Responsive Web Design**:
   - Adapts across desktop monitors, laptops, tablets, and mobile devices.
4. **Dark Mode by Default**:
   - High-contrast dark theme active by default with instant toggle via the topbar or settings.
5. **Autosaving & Local State**:
   - In-progress examination answers automatically persist to browser `localStorage`.
   - Countdown timer persists state across refreshes.
6. **Browser-Native Exports**:
   - CSV export utilizes standard browser `Blob` and download triggers without desktop shell dependencies.

---

## 4. Demo Accounts

- **Teacher**: `alemu.tadesse` / `examly-demo`
- **Student**: `abel.tesfaye` / `examly-demo`

---

## 5. Running the Application

### Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in Chrome, Edge, Safari, or Firefox.

### Production Build
```bash
npm run build
```
Build output is generated in `dist/` ready to deploy to any web host (Vercel, Netlify, Cloudflare Pages, Nginx, Apache, AWS S3).

### Local Preview of Production Build
```bash
npm run preview
```
