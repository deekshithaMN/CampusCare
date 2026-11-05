# CampusCare — Complete Project Guide & SaaS Architecture

Welcome to **CampusCare**, a smart, SaaS-style campus maintenance management platform. This project streamlines maintenance tracking across campus, prevents duplicate complaints through hybrid lexical and semantic similarity matching (RapidFuzz + TF-IDF), prioritizes urgent issues using an explainable multi-factor algorithm, and provides maintenance staff with an operational dispatch queue.

---

## 1. Project Directory Structure

```
CampusCare/
├── backend/                             # Django REST Framework application
│   ├── manage.py                        # Django CLI entrypoint
│   ├── requirements.txt                 # Backend dependencies
│   ├── .env.example                     # Environment template
│   ├── .env                             # Active environment configuration
│   ├── seed_demo.py                     # Demo data population script
│   ├── campuscare_core/                 # Project configuration
│   │   ├── settings.py                  # CORS, JWT, DRF, Database, & Media
│   │   ├── urls.py                      # Global URL routing
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── authentication/                  # User accounts & JWT authentication
│   │   ├── models.py                    # Custom User model (STUDENT, STAFF, ADMIN)
│   │   ├── serializers.py               # Registration & JWT response serializers
│   │   ├── views.py                     # Login, register, profile, staff & user directory
│   │   ├── permissions.py               # IsStudent, IsStaffOrAdmin guards
│   │   └── urls.py                      # /api/auth/*
│   ├── complaints/                      # Maintenance ticket workflows
│   │   ├── models.py                    # Complaint, ComplaintSupport, StatusLog
│   │   ├── serializers.py               # Complaint & Status serializers
│   │   ├── views.py                     # Complaint CRUD, support, duplicate check, stats
│   │   └── urls.py                      # /api/complaints/*
│   ├── services/                        # Python intelligence services
│   │   ├── priority_service.py          # Explainable multi-factor scoring
│   │   ├── duplicate_service.py         # RapidFuzz + scikit-learn TF-IDF engine
│   │   └── image_service.py             # OpenCV + Pillow EXIF sanitization
│   └── media/                           # Sanitized complaint photos
│       └── complaints/
│
├── frontend/                            # React Single-Page Application (Vite)
│   ├── package.json                     # Frontend scripts & dependencies
│   ├── vite.config.js                   # Vite configuration (port 5173)
│   ├── index.html                       # HTML root
│   ├── .env.example                     # Frontend environment template
│   ├── .env                             # Active API base URL configuration
│   └── src/
│       ├── main.jsx                     # Application bootstrap
│       ├── App.jsx                      # Protected routes & shell layout
│       ├── index.css                    # Modern Linear + Stripe + Notion styling
│       ├── api/
│       │   └── axios.js                 # Axios client with JWT interceptor
│       ├── context/
│       │   ├── AuthContext.jsx          # User state, login, register, logout
│       │   └── ToastContext.jsx         # Global notifications stack
│       ├── components/
│       │   ├── Sidebar.jsx              # Collapsible role-based Linear sidebar
│       │   ├── Header.jsx               # Breadcrumbs, universal search, notifications
│       │   ├── MainLayout.jsx           # App layout shell wrapper
│       │   ├── ComplaintCard.jsx        # SaaS complaint card
│       │   ├── ComplaintDetailsModal.jsx# Full details, photo lightbox, status log timeline
│       │   ├── DuplicateAlertModal.jsx  # Candidate duplicate notification & compare
│       │   ├── PriorityExplainModal.jsx # Explainable priority score breakdown
│       │   ├── SkeletonLoader.jsx       # Shimmering loading placeholders
│       │   └── EmptyState.jsx           # Modern empty states with icons
│       └── pages/
│           ├── Login.jsx                # SaaS split-screen login with 1-click demo fill
│           ├── Register.jsx             # Role-based student/staff signup
│           ├── StudentDashboard.jsx     # Welcome banner, KPI metrics, recent activity
│           ├── Feed.jsx                 # Explore feed (Grid & Table views, search, filters)
│           ├── SubmitComplaint.jsx      # Interactive submission with live duplicate check
│           ├── StaffQueue.jsx           # Dispatch table, staff assignment, resolution notes
│           ├── PriorityManagement.jsx   # Priority algorithm sandbox & live math simulator
│           ├── Dashboard.jsx            # Facilities analytics & category distribution
│           └── AdminUsers.jsx           # Campus student & staff directory
└── README.md
```

---

## 2. How the Backend, Frontend, and APIs Connect

### Connection Architecture

```
+-----------------------------------------------------------+
|                   React Frontend (Vite)                   |
|                   http://localhost:5173                   |
|                                                           |
|  [Sidebar]  [StudentDashboard]  [SubmitComplaint] [Queue] |
|       |             |                  |            |     |
|       +-------------+------------------+------------+     |
|                             |                             |
|               src/api/axios.js (Bearer Token)             |
+-----------------------------+-----------------------------+
                              |
                     REST API Calls (JSON / FormData)
                              |
                              v
+-----------------------------------------------------------+
|               Django REST Framework Backend               |
|                   http://127.0.0.1:8000                   |
|                                                           |
|  1. django-cors-headers: Validates origin (localhost:5173)|
|  2. SimpleJWT: Validates `Authorization: Bearer <token>`  |
|  3. Router: Dispatches to /api/auth/ and /api/complaints/ |
+--------------+-----------------------------+--------------+
               |                             |
               v                             v
+-------------------------------+ +-------------------------+
|     PostgreSQL / SQLite       | |   Python Services       |
| Stores: Users, Complaints,    | | - Duplicate Detection   |
| Votes, & Audit Status Logs    | | - Explainable Priority  |
| (campuscare.sqlite3 default)  | | - OpenCV/Pillow Cleaner |
+-------------------------------+ +-------------------------+
```

### The 4 Connection Pillars

1. **API Base URL Configuration:**
   - The frontend `.env` points to the Django server:
     ```ini
     VITE_API_BASE_URL=http://127.0.0.1:8000/api
     VITE_MEDIA_BASE_URL=http://127.0.0.1:8000
     ```
   - All components invoke endpoints through the central instance in `src/api/axios.js`.

2. **CORS Permission (`django-cors-headers`):**
   - In `backend/campuscare_core/settings.py`, incoming requests from `http://localhost:5173` are explicitly allowed:
     ```python
     CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
     CORS_ALLOW_CREDENTIALS = True
     ```

3. **JWT Authentication Flow:**
   - **Login:** React posts credentials to `POST /api/auth/login/`.
   - **Tokens Received:** Backend returns `{ access: "<JWT_TOKEN>", refresh: "<JWT_REFRESH>", user: {...} }`.
   - **Persistent Authorization:** React stores the `access` token in `localStorage`.
   - **Automatic Attachment:** In `src/api/axios.js`, an interceptor automatically adds `headers.Authorization = "Bearer " + token` to all subsequent requests.

4. **Image Storage & Relative Path Resolution:**
   - When a student submits a complaint photo, it is sent as `multipart/form-data`.
   - Django's `services/image_service.py` sanitizes the image (strips EXIF metadata, resizes to max 1280px) and writes the binary to `backend/media/complaints/`.
   - The database stores **only the relative file path** (e.g., `/media/complaints/sanitized_leak.jpg`).
   - The React frontend displays the image by prepending `VITE_MEDIA_BASE_URL` (`http://127.0.0.1:8000/media/...`).

---

## 3. Quickstart: Running Backend & Frontend

### 3.1 Backend Setup (Terminal 1) — Direct / No Virtual Environment

Run directly in your global Python environment without creating a virtual environment:

1. Open PowerShell and navigate to the backend directory:
   ```powershell
   cd C:\Users\mca.d\.gemini\antigravity\scratch\CampusCare\backend
   ```

2. Install the required libraries globally:
   ```powershell
   pip install -r requirements.txt
   ```

3. Run database migrations (creates SQLite database `campuscare.sqlite3` automatically):
   ```powershell
   python manage.py makemigrations
   python manage.py migrate
   ```

4. Seed the demo users and initial sample complaints:
   ```powershell
   python seed_demo.py
   ```
   *(Creates student accounts `student@campus.edu`, `sam@campus.edu`, and staff account `staff@campus.edu` with password `demo1234`)*

5. Start the backend development server:
   ```powershell
   python manage.py runserver 127.0.0.1:8000
   ```
   The backend API is now running live at **`http://127.0.0.1:8000/api/`**!

---

### 3.2 Frontend Setup (Terminal 2)

1. Open a second PowerShell terminal and navigate to the frontend folder:
   ```powershell
   cd C:\Users\mca.d\.gemini\antigravity\scratch\CampusCare\frontend
   ```

2. Install dependencies:
   ```powershell
   npm.cmd install
   ```

3. Start the Vite React development server:
   ```powershell
   npm.cmd run dev
   ```

4. Open your browser and navigate to:
   👉 **`http://localhost:5173`**

---

## 4. Live Hackathon Demo Walkthrough

Follow this 4-step sequence to demonstrate the entire platform:

### Step 1: Submit Complaints & View Feed
1. Open `http://localhost:5173/login` and click **"Demo Student"** $\rightarrow$ Click **"Sign In"**.
2. Click **"+ Report New Issue"** in the sidebar:
   - **Category:** Select `Plumbing`
   - **Severity:** Select `High (+87.5 pts)`
   - **Location:** Select chip `Science Block - 1st Floor Restroom`
   - **Title:** `Broken water tap flooding 1st floor restroom`
   - **Description:** `Sink tap broken, continuous flooding spreading onto the hallway floor.`
3. Click **"Submit Maintenance Report"**.
4. The issue appears in the feed with an initial priority score of $\approx 87.5\text{ pts}$.

### Step 2: Test Real-Time Duplicate Detection
1. Click **"+ Report New Issue"** again (or log in as second student `sam@campus.edu`).
2. Type in:
   - **Category:** `Plumbing`
   - **Location:** `Science Block`
   - **Title:** `Tap leaking water in 1st floor Science Block washroom`
3. As you finish typing, the **Duplicate Alert Modal Pops Up!**  
   The hybrid engine (RapidFuzz + TF-IDF) identifies a $\approx 80\%$ similarity match with the existing complaint.
4. Click **"Support This Issue"** in the modal.

### Step 3: Verify Explainable Priority Boost & Live Math Simulator
1. The feed opens: the existing issue now has **1 Supporter**.
2. The priority score has risen from **$87.5 \rightarrow 97.5\text{ pts}$**.
3. Click the **"Score: 97.5 pts"** badge on the complaint card:
   - An explainable calculation card opens showing:
     - **Base Severity Impact:** $+87.5\text{ pts}$ (High weight $3.5 \times 25$)
     - **Community Support Impact:** $+10.0\text{ pts}$ ($1\text{ supporter} \times 10$)
     - **Urgency over Time:** $+0.0\text{ pts}$ ($0\text{ hrs} \times 1.5$)
     - **Formula:** $\text{Score} = (\text{SeverityWeight} \times 25) + (\text{Supporters} \times 10) + (\text{HoursPending} \times 1.5)$
4. Navigate to **"Priority Engine"** in the sidebar to use the **Live Algorithm Simulator** (adjust sliders for severity, supporters, and hours to test calculations live!).

### Step 4: Staff Triage & Resolution Workflow
1. Click **Sign Out** in the sidebar footer.
2. Sign in with **"Demo Staff"** (`staff@campus.edu` / `demo1234`).
3. Click **"Dispatch Queue"** in the sidebar:
   - See all complaints ranked strictly by priority score.
4. On the highest-priority plumbing ticket, click **"Start Work"**:
   - Status transitions from `PENDING` $\rightarrow$ `IN_PROGRESS`.
5. Click **"Resolve"** or **"Details"**:
   - Enter a resolution note: *"Turned off shutoff valve and installed replacement faucet assembly."*
   - Click **"Save Status & Log Update"**.
   - Status transitions to `RESOLVED` with completion timestamp and audit log trail.
6. Click **"Analytics"** in the sidebar to view real-time KPI counts, category progress bars, and campus resolution rate.

---

## 5. API Reference Summary

| Endpoint | Method | Permission | Description |
|---|---|---|---|
| `/api/auth/register/` | POST | Public | Register student or staff user |
| `/api/auth/login/` | POST | Public | Authenticate and obtain JWT access & refresh tokens |
| `/api/auth/me/` | GET | Authenticated | Fetch current user profile & role |
| `/api/auth/staff/` | GET | Authenticated | List all staff members for task assignment |
| `/api/auth/users/` | GET | Authenticated | List all campus users for directory |
| `/api/complaints/` | GET | Authenticated | List complaints sorted by priority score |
| `/api/complaints/` | POST | Student | Submit new complaint with optional photo |
| `/api/complaints/check-duplicate/` | POST | Authenticated | Scan active tickets for lexical/semantic duplicate matches |
| `/api/complaints/{id}/support/` | POST | Student | Upvote an existing complaint and boost priority |
| `/api/complaints/{id}/status/` | PATCH | Staff / Admin | Assign staff, write notes, and transition ticket status |
| `/api/complaints/dashboard-stats/` | GET | Staff / Admin | Get aggregated KPI summary and category counts |

---

## 6. Troubleshooting

- **Backend Offline / Connection Refused:** Make sure `python manage.py runserver 127.0.0.1:8000` is running in your backend terminal.
- **CORS Error in Browser Console:** Verify that the frontend origin (`http://localhost:5173`) is listed in `backend/.env` under `CORS_ALLOWED_ORIGINS`.
- **401 Unauthorized:** If your JWT token expires (valid for 120 minutes), simply log in again or click one of the quick demo buttons on the login page.
- **Port Conflict:** If port `8000` is occupied, start Django on another port (`python manage.py runserver 127.0.0.1:8080`) and update `VITE_API_BASE_URL` in `frontend/.env`.
