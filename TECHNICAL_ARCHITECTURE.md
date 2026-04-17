# AI-First CRM for Pharmaceutical Sales Representatives
## Technical Architecture Documentation

### Overview
An AI-powered Customer Relationship Management system designed specifically for pharmaceutical field representatives to manage Healthcare Professional (HCP) interactions using natural language chat and structured forms.

---

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   Database      │
│   React + RTK   │◄──►│   FastAPI +     │◄──►│  PostgreSQL     │
│   Vite + TS     │    │   LangGraph      │    │   (Render.com)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                      ┌──────────────────┐
                      │   External AI    │
                      │   Groq API       │
                      │ (Llama 3.3 70B)  │
                      └──────────────────┘
```

---

## Frontend Architecture

### Tech Stack
- **Framework**: React 18.3.1 with TypeScript 5.6.3
- **Build Tool**: Vite 5.4.11
- **State Management**: Redux Toolkit 2.3.0 with RTK Query
- **Styling**: Tailwind CSS 3.4.15
- **Development**: ESLint for linting, TypeScript for type checking

### Key Components Structure
```
frontend/src/
├── components/
│   ├── ChatPanel.tsx           # AI chat interface
│   ├── HCPSelector.tsx         # Healthcare provider selection
│   ├── InteractionList.tsx     # Display interaction history
│   ├── LogInteractionScreen.tsx # Main interaction logging UI
│   ├── StructuredForm.tsx      # Form-based interaction entry
│   └── EditInteractionModal.tsx # Edit existing interactions
├── store/
│   ├── index.ts               # Redux store configuration
│   ├── api.ts                 # RTK Query API endpoints
│   ├── chatSlice.ts          # Chat state management
│   └── uiSlice.ts            # UI state (selected HCP, mode)
├── types/                     # TypeScript type definitions
├── hooks.ts                   # Typed Redux hooks
└── main.tsx                   # Application entry point
```

### State Management Architecture

#### Redux Store Structure
```typescript
{
  api: {
    // RTK Query cache for API calls
    hcps: HCP[],                    // Healthcare providers
    interactions: Interaction[],     // Sales interactions
    // Optimistic updates & caching
  },
  ui: {
    selectedHcpId: number | null,   // Currently selected HCP
    mode: "form" | "chat",          // Input mode
    editingInteractionId: number | null
  },
  chat: {
    turns: ChatTurn[],              // Conversation history
    history: ChatMessage[],         // Messages for API
    pending: boolean                // Loading state
  }
}
```

#### API Integration
- **Base URL**: `http://localhost:8000/api/v1`
- **Endpoints**:
  - `GET /hcps` - Search healthcare providers
  - `GET /interactions` - List interactions with filtering
  - `POST /interactions` - Create new interaction
  - `PATCH /interactions/:id` - Update interaction
  - `DELETE /interactions/:id` - Delete interaction
  - `POST /chat` - AI chat interface

---

## Backend Architecture

### Tech Stack
- **Framework**: FastAPI 0.115.0+ with async support
- **Database**: PostgreSQL with AsyncPG driver
- **ORM**: SQLAlchemy 2.0+ (async)
- **AI Framework**: LangGraph 0.2.50+ with LangChain Core
- **LLM Provider**: Groq API (Llama 3.3 70B Versatile)
- **Migration**: Alembic for database schema management
- **Testing**: Pytest with async support

### Project Structure
```
backend/
├── app/
│   ├── api/v1/                 # API routes
│   │   ├── chat.py            # AI chat endpoint
│   │   ├── hcps.py            # HCP CRUD operations
│   │   ├── interactions.py     # Interaction CRUD
│   │   └── router.py          # Route aggregation
│   ├── agent/                  # LangGraph AI agent
│   │   ├── graph.py           # Workflow definition
│   │   ├── state.py           # Agent state management
│   │   ├── llm.py            # LLM configuration
│   │   ├── prompts.py         # System prompts
│   │   └── tools/             # Agent tools
│   ├── core/
│   │   ├── config.py          # Environment configuration
│   │   ├── database.py        # Database connection
│   │   └── deps.py            # Dependency injection
│   ├── models/                # SQLAlchemy models
│   │   ├── hcp.py            # Healthcare provider model
│   │   ├── interaction.py     # Interaction model
│   │   ├── product.py         # Product model
│   │   └── follow_up.py       # Follow-up scheduling
│   ├── repositories/          # Data access layer
│   ├── schemas/               # Pydantic models
│   └── scripts/seed.py        # Database seeding
├── tests/                     # Test suite
└── alembic/                   # Database migrations
```

### Database Schema

#### Core Models
```sql
-- Healthcare Professionals
CREATE TABLE hcps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    specialty VARCHAR(100),
    hospital VARCHAR(200),
    city VARCHAR(100),
    email VARCHAR(200),
    phone VARCHAR(50),
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Interactions
CREATE TABLE interactions (
    id SERIAL PRIMARY KEY,
    hcp_id INTEGER REFERENCES hcps(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,  -- visit|call|email|chat
    outcome VARCHAR(50),           -- positive|neutral|negative|follow_up
    sentiment VARCHAR(20),         -- positive|neutral|negative
    summary TEXT,
    raw_notes TEXT,
    products_discussed JSONB,      -- Array of product names
    next_step TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow-up Scheduling
CREATE TABLE follow_ups (
    id SERIAL PRIMARY KEY,
    hcp_id INTEGER REFERENCES hcps(id) ON DELETE CASCADE,
    interaction_id INTEGER REFERENCES interactions(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    task_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## AI Agent Architecture (LangGraph)

### Agent Workflow
```mermaid
graph TD
    A[User Message] --> B[Agent Node]
    B --> C{Tools Needed?}
    C -->|Yes| D[Tool Node]
    C -->|No| E[End]
    D --> B
    E --> F[Response]
```

### LangGraph Implementation

#### State Management
```python
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    hcp_context: dict | None  # Currently selected HCP details
```

#### Agent Tools (6 specialized functions)
1. **`log_interaction`** - Create new HCP interactions
   - Extracts structured data from free-form notes using LLM
   - Stores: summary, outcome, sentiment, products, next steps

2. **`edit_interaction`** - Update existing interactions
   - Patches specific fields by interaction ID
   - Maintains audit trail through timestamps

3. **`search_hcp`** - Find healthcare providers
   - Fuzzy search by name, specialty, city
   - Returns ranked results for selection

4. **`schedule_followup`** - Create future reminders
   - Links to HCP and optionally to interaction
   - Supports various task types and descriptions

5. **`summarize_history`** - Review past interactions
   - Aggregates recent interactions for specific HCP
   - Provides context for ongoing relationships

6. **`recommend_next_action`** - Strategic suggestions
   - Analyzes interaction history and HCP profile
   - Suggests products, topics, or communication channels

### LLM Configuration
- **Provider**: Groq API
- **Model**: `llama-3.3-70b-versatile`
- **Temperature**: 0.2 (focused, consistent responses)
- **Max Tokens**: 1024
- **Tools**: Bound to all 6 agent functions

### System Prompt (RepPilot Persona)
```
You are **RepPilot**, an AI sales companion for pharmaceutical field representatives.
Your job is to help a rep manage interactions with Healthcare Professionals (HCPs) using a CRM.

## Rules
- Call exactly ONE tool per turn unless the user clearly requests multiple
- After a tool returns, respond in concise natural language (2-4 sentences)
- When a tool has `hcp_id` and user has selected an HCP, default to that id
- If you don't know the HCP id, call `search_hcp` first, never invent ids
- Never fabricate interaction ids, HCP ids, or medical facts
- Keep responses professional and life-sciences-aware
```

---

## Data Flow & Communication

### Frontend → Backend Communication
1. **API Calls**: RTK Query manages all HTTP requests
2. **Optimistic Updates**: UI updates immediately, syncs with server
3. **Error Handling**: Automatic retry with exponential backoff
4. **Caching**: Intelligent cache invalidation on mutations

### Chat Workflow
```
User Input → Redux Action → API Call → LangGraph → Tools → Database → Response → Redux State → UI Update
```

### AI Agent Execution Flow
1. **Request Processing**: FastAPI receives chat request
2. **Context Building**: Load selected HCP details if available
3. **LangGraph Execution**:
   - System prompt with HCP context
   - User message appended to history
   - Agent decides on tool usage
   - Tools execute database operations
   - Final response generation
4. **Response Formatting**: Extract reply text and tool events
5. **Frontend Update**: Redux state updated with conversation

---

## Environment Configuration

### Backend Environment Variables
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
GROQ_API_KEY=gsk_...                    # Groq API authentication
GROQ_MODEL=llama-3.3-70b-versatile      # LLM model selection
CORS_ORIGINS=http://localhost:5173      # Frontend URLs
LOG_LEVEL=INFO                          # Logging verbosity
ENVIRONMENT=development                 # Runtime environment
```

### Frontend Environment Variables
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1  # Backend API endpoint
```

---

## Deployment Architecture

### Database
- **Provider**: Render.com PostgreSQL
- **Connection**: SSL required for production
- **Pool**: 5 connections, max overflow 10
- **Migrations**: Alembic for schema versioning

### Backend Deployment
- **ASGI Server**: Uvicorn with async workers
- **API Documentation**: Auto-generated OpenAPI/Swagger
- **Health Checks**: `/health` endpoint for monitoring

### Frontend Deployment
- **Build**: TypeScript compilation + Vite bundling
- **Static Assets**: Optimized for CDN delivery
- **Hot Reload**: Development server on port 5173

---

## Security Considerations

### API Security
- **CORS**: Configured for specific frontend origins
- **Input Validation**: Pydantic schemas for all endpoints
- **SQL Injection**: SQLAlchemy ORM prevents direct SQL
- **Rate Limiting**: Can be added via FastAPI middleware

### Data Privacy
- **Healthcare Data**: Follows HIPAA-like considerations
- **API Keys**: Environment variables, never committed
- **Database**: SSL connections in production

---

## Performance Optimizations

### Frontend
- **Code Splitting**: Vite bundles for optimal loading
- **State Management**: Normalized Redux store structure
- **Caching**: RTK Query automatic background refetching
- **TypeScript**: Compile-time error detection

### Backend
- **Async Operations**: Full async/await throughout
- **Database Pooling**: Connection reuse and management
- **Query Optimization**: Indexed columns for search
- **LLM Caching**: LRU cache for agent graph compilation

### AI Agent
- **Tool Selection**: Conditional execution based on user intent
- **Context Management**: Efficient state passing between nodes
- **Response Generation**: Streaming support for real-time feel

---

## Development Workflow

### Frontend Development
```bash
cd frontend
npm install
npm run dev          # Development server
npm run typecheck    # Type verification
npm run lint         # Code quality
npm run build        # Production build
```

### Backend Development
```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload  # Development server
pytest                         # Run tests
alembic upgrade head          # Apply migrations
ruff check                    # Linting
mypy app                      # Type checking
```

### Testing Strategy
- **Frontend**: Component testing with React Testing Library
- **Backend**: Unit tests with pytest-asyncio
- **Integration**: API endpoint testing
- **AI Agent**: Tool execution and workflow testing

---

## Monitoring & Observability

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: Configurable via environment
- **Error Tracking**: Exception handling with context

### Metrics
- **API Performance**: Request/response times
- **Database**: Connection pool usage, query performance
- **AI Agent**: Tool execution frequency, success rates
- **User Interactions**: Feature usage analytics

---

## Future Enhancements

### Planned Features
1. **Real-time Notifications**: WebSocket for live updates
2. **Advanced Analytics**: Interaction trend analysis
3. **Mobile App**: React Native implementation
4. **Offline Support**: Progressive Web App capabilities
5. **Multi-tenant**: Support for multiple pharmaceutical companies
6. **Enhanced AI**: Custom fine-tuned models for pharmaceutical domain

### Scalability Considerations
- **Database Sharding**: Partition by geography or company
- **API Gateway**: Load balancing and rate limiting
- **Caching Layer**: Redis for frequent queries
- **AI Agent**: Horizontal scaling with worker pools
- **CDN**: Global content delivery for static assets

---

## Conclusion

This AI-first CRM represents a modern approach to pharmaceutical sales management, combining traditional CRM functionality with conversational AI capabilities. The architecture is designed for scalability, maintainability, and user experience, leveraging cutting-edge technologies in both frontend and backend development.

The LangGraph integration provides a powerful framework for building complex AI workflows, while the React/Redux frontend ensures a responsive and intuitive user interface. The FastAPI backend offers high performance and excellent developer experience with automatic documentation and type safety.