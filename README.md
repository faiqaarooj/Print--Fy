# Print-Fy 🖨️⚡

> **Campus Print-Queue Management & Document Processing System**  
> Built by **Faiqa Arooj**

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-3776AB?style=flat&logo=python)](https://fastapi.tiangolo.com)
[![Pitch Deck](https://img.shields.io/badge/Design%20Presentation-Canva-00C4CC?style=flat&logo=canva)](https://www.canva.com/design/DAHP1kednAc/q_A71mLBkMYYajhjO9saIw/edit)

---

## 📌 Project Overview

**Print-Fy** eliminates physical wait times at campus printing centers by providing a real-time digital FIFO queue, intelligent document analysis, operator management dashboard, and instant print job status tracking.

- **Presentation / Design Deck:** [View on Canva](https://www.canva.com/design/DAHP1kednAc/q_A71mLBkMYYajhjO9saIw/edit)
- **System Architecture & PRD:** See [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) and [`printify-prd.md`](./printify-prd.md)

---

## ✨ Features

- **Digital FIFO Queue:** Real-time queue placement and dynamic wait time estimation.
- **Document Studio:** Multi-page document upload with auto-calculation of page count, color/duplex pricing, and student print quota.
- **AI Print Studio & Copilot:** Smart page layout recommendations, contrast enhancements, and ink-saver modes.
- **Operator Desk Management:** Real-time queue review for shop attendants, status transitions (`Queued` → `Printing` → `Ready` → `Collected`), and paper/ink alerts.
- **Vercel SPA Ready:** Configured with `vercel.json` for client-side routing and instant continuous deployment.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router DOM, Lucide Icons, CSS Design System
- **Backend:** Python FastAPI, SQLite, Pydantic, Uvicorn
- **Payments & Billing:** Pakistani local payment integrations (Kuickpay, JazzCash/EasyPaisa ready)
- **Deployment:** Vercel (Frontend), Python ASGI Server (Backend)

---

## 🚀 Getting Started

### 1. Frontend Setup (React + Vite)

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 2. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI server
bash run.sh
# Or directly:
uvicorn app.main:app --reload --port 8000
```

---

## 🌐 Deploy to Vercel

1. Import this repository into [Vercel](https://vercel.com).
2. Framework preset will automatically detect **Vite**.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Client-side routing is configured via [`vercel.json`](./vercel.json).

---

## 👩‍💻 Author

**Faiqa Arooj**  
- GitHub: [@faiqaarooj](https://github.com/faiqaarooj)
- Project Repository: [Print--Fy](https://github.com/faiqaarooj/Print--Fy)
