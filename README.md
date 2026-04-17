# AI-First CRM — HCP Module (Log Interaction Screen)

> Round 1 interview assignment. An AI-first CRM for pharmaceutical sales reps, centred on the
> **Log Interaction Screen** for Healthcare Professionals (HCPs). A rep can log a visit either
> through a structured form or by chatting with a LangGraph agent that drives a toolbelt of
> six CRM actions backed by Groq LLMs (brief specified `gemma2-9b-it`; see Environment
> variables below for the currently-supported replacement).

---

## Architecture

```
┌────────────────────────────┐          ┌──────────────────────────────────┐
│  React + Redux Toolkit     │  HTTPS   │  FastAPI (async)                 │
│  Vite + Tailwind + Inter   │ ───────▶ │  - /api/v1/hcps                  │
│                            │          │  - /api/v1/interactions          │
│  LogInteractionScreen      │          │  - /api/v1/chat  (SSE)           │
│   ├─ StructuredForm        │          │                                  │
│   └─ ChatPanel             │          │  LangGraph StateGraph            │
└────────────────────────────┘          │   ├─ ChatGroq(llama-3.3-70b)     │
                                        │   └─ ToolNode (6 tools)          │
                                        │        log_interaction           │
                                        │        edit_interaction          │
                                        │        search_hcp                │
                                        │        schedule_followup         │
                                        │        summarize_history         │
                                        │        recommend_next_action     │
                                        └──────────────┬───────────────────┘
                                                       │ asyncpg
                                                       ▼
                                               PostgreSQL (Render)
                                               hcps · products ·
                                               interactions · follow_ups
```

### LangGraph agent — role

The agent is a **Sales Companion** for pharmaceutical field reps. Given the currently
selected HCP and a natural-language message, it decides which of six tools to call and in
what order, then returns a rep-friendly response. The agent lets reps run the CRM by
conversation — "Log that I met Dr. Sharma today about Atorvastatin, she was positive, follow
up in two weeks" — instead of filling forms.

### Tools

| # | Name | Signature (simplified) | Uses LLM? |
|---|------|------------------------|-----------|
| 1 | `log_interaction`      | `(hcp_id, raw_notes, channel?, occurred_at?) → interaction` | yes — entity extraction + summary |
| 2 | `edit_interaction`     | `(interaction_id, **fields) → interaction` | no |
| 3 | `search_hcp`           | `(query, specialty?, city?) → [hcp]` | no |
| 4 | `schedule_followup`    | `(hcp_id, due_at, note, interaction_id?) → follow_up` | no |
| 5 | `summarize_history`    | `(hcp_id, limit=5) → str` | yes — summarisation |
| 6 | `recommend_next_action`| `(hcp_id) → str` | yes — reasoning |

---

## Local setup

Two one-command paths. Pick one.

### Option A — Docker Compose (simplest)

```bash
cp backend/.env.example backend/.env        # paste GROQ_API_KEY
cp frontend/.env.example frontend/.env
docker compose up --build
```

Open http://localhost:5173.

### Option B — Native

```bash
# 1. Backend
cd backend
cp .env.example .env                        # paste GROQ_API_KEY
uv sync                                      # or: pip install -e .
uv run alembic upgrade head
uv run python -m app.scripts.seed
uv run uvicorn app.main:app --reload

# 2. Frontend (in another shell)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Backend on http://localhost:8000, frontend on http://localhost:5173, OpenAPI docs at
http://localhost:8000/docs.

---

## Environment variables

### Backend (`backend/.env`)

| Key | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host/db` | Async driver form. Render requires SSL. |
| `GROQ_API_KEY` | `gsk_...` | Get one at https://console.groq.com |
| `GROQ_MODEL`   | `llama-3.3-70b-versatile` | Brief named `gemma2-9b-it`, but Groq has since decommissioned it. The brief's alternative `llama-3.3-70b-versatile` is the current default. |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated. |
| `LOG_LEVEL`    | `INFO` |  |

### Frontend (`frontend/.env`)

| Key | Example |
|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` |

---

## Running tests

```bash
cd backend
uv run pytest -q
```

---

## Project layout

```
sandesh/
├── backend/        FastAPI + LangGraph + SQLAlchemy (async) + Alembic
├── frontend/       Vite + React 18 + Redux Toolkit + RTK Query + Tailwind
├── docker-compose.yml
├── README.md
└── TASK2_QMS.md    Study guide for the Task 2 QMS video
```

See `backend/README.md` and `frontend/README.md` for deeper dives.

---

## Video walkthrough

Record a 10–15 min screen-cast that covers:

1. Tour the frontend at `localhost:5173`.
2. Log an interaction via the **structured form**, confirm the row in `/interactions`.
3. Switch to **chat mode** and trigger every tool:
   - "Log that I met Dr. Sharma today about Atorvastatin; positive response, follow up in two weeks." → `log_interaction`
   - "Edit that last one — outcome was neutral not positive." → `edit_interaction`
   - "Find all endocrinologists in Bangalore." → `search_hcp`
   - "Schedule a follow-up with Dr. Patel for next Monday." → `schedule_followup`
   - "Summarise my last five meetings with Dr. Sharma." → `summarize_history`
   - "What should I pitch to Dr. Patel next?" → `recommend_next_action`
4. Walk through the code: LangGraph in `backend/app/agent/`, FastAPI routers in `api/v1/`,
   React in `frontend/src/features/logInteraction/`.
5. Close with a 60-second personal takeaway.
