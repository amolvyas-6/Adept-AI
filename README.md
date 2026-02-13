# Adept AI - Educational Document Management & AI Chat Platform

## Project Overview

Adept AI is a comprehensive Learning Management System (LMS) that enables students and educators to organize, share, and interact with academic documents through an intelligent AI-powered chat interface. The platform combines traditional document management with cutting-edge Retrieval-Augmented Generation (RAG) technology, allowing users to have natural conversations with their PDF documents.

### Core Value Proposition

- **Document Management**: Upload, organize, and share academic PDFs by university, department, and course
- **Library System**: Create personal libraries to curate relevant documents
- **AI-Powered Chat**: Ask questions and get intelligent responses from your documents using multimodal RAG
- **Collaborative Learning**: Share documents across courses and departments for collective learning

---

## System Architecture

The application follows a **modern three-tier architecture** with React frontend and FastAPI backend:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│     React 19 + Vite + TypeScript + Tailwind CSS v4          │
│               shadcn/ui (radix-vega style)                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ (REST API + Auth)
                  │
        ┌─────────┴──────────┬──────────────────────┐
        │                    │                      │
┌───────▼────────┐  ┌────────▼────────┐  ┌─────────▼─────────┐
│    FastAPI     │  │   Supabase      │  │    MongoDB        │
│    Backend     │  │  (Auth + DB)    │  │  (Chat Store)     │
│  (Python 3.11) │  │   PostgreSQL    │  │                   │
└───────┬────────┘  └─────────────────┘  └───────────────────┘
        │
        ├──────────────────┬──────────────────────┐
        │                  │                      │
┌───────▼────────┐  ┌──────▼─────────┐  ┌────────▼──────────┐
│  Cloudflare R2 │  │    Qdrant      │  │   Groq API        │
│  (S3 Storage)  │  │ Vector Store   │  │  (LLM Inference)  │
│  PDF Files     │  │  Embeddings    │  │                   │
└────────────────┘  └────────────────┘  └───────────────────┘
```

### Technology Stack

#### Frontend (`/frontend`)
- **Framework**: React 19 with Vite (TypeScript)
- **Styling**: Tailwind CSS v4 with OKLCH color system
- **UI Components**: shadcn/ui (radix-vega style preset) with Radix UI primitives
- **Forms**: react-hook-form + zod validation
- **Routing**: react-router v7
- **State Management**: React Context API (ThemeProvider)
- **PDF Rendering**: react-pdf (pdf.js wrapper)
- **Notifications**: sonner (toast notifications)
- **Animations**: tw-animate-css, motion (Framer Motion)

#### FastAPI Backend (`/fastapi-backend`)
- **Framework**: FastAPI (Python 3.11+)
- **Authentication**: Supabase Auth (JWT-based)
- **Databases**: 
  - Supabase PostgreSQL (user data, documents, courses, universities)
  - MongoDB (chat history storage)
- **File Storage**: Cloudflare R2 (S3-compatible) via boto3
- **AI/ML Stack**: 
  - LangChain (orchestration framework)
  - Groq (LLM inference - fast inference API)
  - Sentence Transformers (text embeddings)
- **Vector Database**: Qdrant (similarity search)
- **Document Processing**: PyMuPDF (PDF text extraction), LangChain text splitters
- **API Design**: RESTful with consistent response format

#### Infrastructure & Services
- **Backend Framework**: FastAPI (async Python)
- **Authentication**: Supabase Auth
- **Databases**: Supabase PostgreSQL + MongoDB
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Vector Search**: Qdrant (local/cloud deployment)
- **Embeddings**: SentenceTransformer (`all-MiniLM-L6-v2` model)
- **LLM**: Groq API (for fast inference)

---

## AI-Powered Chat System

### Multimodal RAG Implementation

The platform implements a **Retrieval-Augmented Generation (RAG)** pipeline that allows users to chat with their PDF documents. The system combines semantic search, context retrieval, and large language models to provide accurate, document-grounded responses.

### RAG Architecture

```
User Question
     │
     ▼
┌─────────────────────┐
│  Query Embedding    │  ← Sentence Transformers
│  (384-dim vector)   │     (all-MiniLM-L6-v2)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Qdrant Vector DB   │  ← Similarity Search
│  (COSINE distance)  │     (top-k retrieval)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Context Retrieval  │  ← Relevant document chunks
│  (filtered by docs) │     with metadata
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  LLM Augmentation   │  ← Groq API (fast inference)
│  (context + query)  │     Context-aware generation
└──────────┬──────────┘
           │
           ▼
     AI Response
```

### Key Components

#### 1. Document Ingestion Pipeline

When a user uploads a PDF document:

1. **File Upload**: PDF uploaded to Cloudflare R2 storage at `documents/{document_id}.pdf`
2. **Text Extraction**: PyMuPDF extracts text content from all pages
3. **Text Chunking**: LangChain RecursiveCharacterTextSplitter breaks text into semantic chunks
   - Chunk size: Configurable (typically 500-1000 tokens)
   - Overlap: Ensures context preservation across chunks
4. **Embedding Generation**: SentenceTransformer generates 384-dimensional embeddings
5. **Vector Storage**: Qdrant stores embeddings with metadata:
   - `document_id`: Source document UUID
   - `page`: Page number in original PDF
   - `chunk`: Sequential chunk identifier
   - `content`: Original text chunk

#### 2. RAG Utility Class (`app/utils/rag.py`)

```python
class RAGUtility:
    - Manages Qdrant client connection
    - Handles embedding model initialization (all-MiniLM-L6-v2)
    - insert_to_collection(): Batch insert document vectors
    - search_similar(): Query-time retrieval with optional document filtering
    - Supports multi-document filtering (chat with up to 5 PDFs simultaneously)
```

**Key Features:**
- **Semantic Search**: COSINE distance metric for similarity matching
- **Document Filtering**: Query specific documents using `document_id` filter
- **Configurable Retrieval**: Adjust `top_k` parameter for context window size
- **Metadata Preservation**: Maintains document provenance for citations

#### 3. Chat Management System

**MongoDB Chat Schema:**
```json
{
  "_id": "ObjectId",
  "user_id": "UUID",
  "document_ids": ["UUID[]"],  // Up to 5 documents
  "messages": [
    {
      "role": "user | assistant",
      "content": "string",
      "timestamp": "datetime"
    }
  ],
  "title": "string",
  "created_at": "datetime"
}
```

**Chat Features:**
- Create chat sessions linked to one or more documents
- Add/remove documents from active chat (max 5 documents)
- Persistent message history with role-based structure
- User-scoped access control
- Real-time AI responses with streaming support

#### 4. Query Processing Workflow

When a user sends a message:

1. **Message Storage**: User query stored in MongoDB chat collection
2. **Document Context**: Retrieve `document_ids` from active chat
3. **Query Embedding**: Transform user query into 384-dim vector
4. **Vector Search**: Query Qdrant with document filter, retrieve top-k chunks
5. **Context Assembly**: Combine retrieved chunks into prompt context
6. **LLM Generation**: Send context + query to Groq API for response
7. **Response Storage**: AI response stored in MongoDB with role="assistant"
8. **UI Streaming**: Response streamed back to frontend via WebSocket/SSE

### AI Chat Endpoints

**FastAPI Routes (`/chats` prefix):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats/` | List all user's chat sessions |
| GET | `/chats/{chatId}` | Retrieve specific chat with full message history |
| POST | `/chats/` | Create new chat session with initial document |
| POST | `/chats/{chatId}/messages` | Send message and receive AI response |
| POST | `/chats/{chatId}/documents/{documentId}` | Add document to chat context |
| DELETE | `/chats/{chatId}/documents/{documentId}` | Remove document from chat |
| DELETE | `/chats/{chatId}` | Delete chat session |

### Frontend Chat Interface

The `ChatsPage` component provides a rich conversational UI:

- **PDF Viewer**: Side-by-side PDF display with page navigation
- **Message Thread**: Conversation history with user/assistant role distinction
- **Multi-Document Support**: Visual indicators for active documents in chat
- **Suggested Questions**: Quick-start prompts for document exploration
- **Real-time Responses**: Streaming AI responses with loading states
- **Document Switching**: Navigate between multiple PDFs in context

**Key UI Components:**
- `Conversation` / `ConversationContent`: Message container with auto-scroll
- `Message` / `MessageContent`: Individual message bubbles
- `PromptInput`: Text input with submit handling
- `Suggestions`: Pre-built question templates

---

## Database Schema

### Supabase PostgreSQL Tables

#### `profiles`
```sql
- id (UUID, FK to auth.users)
- full_name (TEXT)
- role (TEXT) -- 'student' | 'teacher'
- created_at (TIMESTAMP)
```

#### `universities`
```sql
- id (UUID, PK)
- name (TEXT)
- location (TEXT)
- created_at (TIMESTAMP)
```

#### `departments`
```sql
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- university_id (UUID, FK to universities)
- created_at (TIMESTAMP)
```

#### `courses`
```sql
- id (UUID, PK)
- name (TEXT)
- code (TEXT) -- e.g., "CS101"
- department_id (UUID, FK to departments)
- university_id (UUID, FK to universities)
- created_at (TIMESTAMP)
```

#### `documents`
```sql
- id (UUID, PK)
- title (TEXT)
- unit (INTEGER) -- Unit/chapter number
- course_id (UUID, FK to courses)
- user_id (UUID, FK to profiles) -- Uploader
- created_at (TIMESTAMP)
```

#### `libraries`
```sql
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- user_id (UUID, FK to profiles)
- created_at (TIMESTAMP)
```

#### `library_documents`
```sql
- library_id (UUID, FK to libraries)
- document_id (UUID, FK to documents)
- PRIMARY KEY (library_id, document_id)
```

### MongoDB Collections

#### `chats`
```json
{
  "_id": "ObjectId",
  "user_id": "UUID",
  "document_ids": ["UUID", ...], // Max 5
  "messages": [
    {
      "role": "user | assistant",
      "content": "TEXT",
      "timestamp": "ISODate"
    }
  ],
  "title": "TEXT",
  "created_at": "ISODate"
}
```

### Qdrant Vector Store

#### Collection: `pdf_embeddings`
```json
{
  "id": "UUID",
  "vector": [float × 384],  // SentenceTransformer embeddings
  "payload": {
    "document_id": "UUID",
    "page": "int",
    "chunk": "int",
    "content": "TEXT"
  }
}
```

---

## API Architecture

### FastAPI Backend Endpoints

Base URL: `http://localhost:3000` (configurable via `PORT`)

#### Authentication (`/auth`)
- **POST** `/auth/register` - Create user account + profile
  - Body: `{ email, password, full_name, role }`
  - Returns: `{ user, session }`
- **POST** `/auth/login` - Handled by Supabase client on frontend

#### Profiles (`/profiles`)
- **GET** `/profiles/me` - Get current user profile
- **PUT** `/profiles/me` - Update current user profile

#### Universities (`/universities`)
- **GET** `/universities` - List all universities
- **GET** `/universities/{id}` - Get university details
- **POST** `/universities` - Create university (admin)

#### Departments (`/departments`)
- **GET** `/departments?university_id={id}` - List departments
- **GET** `/departments/{id}` - Get department details
- **POST** `/departments` - Create department

#### Courses (`/courses`)
- **GET** `/courses?department_id={id}&university_id={id}` - List courses
- **GET** `/courses/{id}` - Get course details
- **POST** `/courses` - Create course

#### Documents (`/documents`)
- **GET** `/documents?course_id={id}&search={query}&university_id={id}` - List/search documents
- **GET** `/documents/{id}` - Get document details
- **POST** `/documents` - Upload document (multipart/form-data)
  - Fields: `title`, `unit`, `courseId`, `document` (PDF file)
  - Max size: 10MB
  - Returns: Document metadata (file stored in R2)
- **DELETE** `/documents/{id}` - Delete document (owner only)

#### Libraries (`/libraries`)
- **GET** `/libraries` - List user's libraries
- **GET** `/libraries/{id}` - Get library with documents
- **POST** `/libraries` - Create library
- **PUT** `/libraries/{id}` - Update library
- **DELETE** `/libraries/{id}` - Delete library
- **POST** `/libraries/{id}/documents/{documentId}` - Add document to library
- **DELETE** `/libraries/{id}/documents/{documentId}` - Remove document from library

#### Chats (`/chats`)
- **GET** `/chats/` - List user's chat sessions
- **GET** `/chats/{chatId}` - Get chat with messages
- **POST** `/chats/?documentId={uuid}` - Create new chat
- **POST** `/chats/{chatId}/messages` - Send message, get AI response
  - Body: `{ content: string, role: 'user' }`
  - Returns: `{ content: string, role: 'assistant' }`
- **POST** `/chats/{chatId}/documents/{documentId}` - Add document to chat
- **DELETE** `/chats/{chatId}/documents/{documentId}` - Remove document from chat
- **DELETE** `/chats/{chatId}` - Delete chat session

#### Documents (AI Processing)
- **POST** `/documents/process` - Process uploaded PDF for RAG
  - Extracts text, generates embeddings, stores in Qdrant
  - Triggered after document upload to R2

### Response Format

All API responses follow consistent structure:

```json
{
  "success": true,
  "data": { /* response payload */ },
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Frontend Application

### Page Structure

1. **HomePage** (`/`) - Landing page with features, CTA
2. **AuthPage** (`/auth`) - Login/Register with Supabase auth
3. **DashboardPage** (`/dashboard`) - Protected, main navigation hub
4. **DocumentsPage** (`/documents`) - Browse/upload documents by course
5. **LibraryPage** (`/library`) - Manage personal document libraries
6. **ChatsPage** (`/chats/:id`) - AI chat interface with PDF viewer
7. **ProfilePage** (`/profile`) - User profile management

### Design System

#### Color Scheme (OKLCH)
- **Primary**: Indigo (`bg-indigo-600`) for CTAs
- **Accents**: Rose, Emerald for feature highlights
- **Theme**: Light/dark mode via `ThemeProvider` (localStorage: `vite-ui-theme`)

#### Animation Patterns
```tsx
// Page elements
<header className="animate-fade-in-down">
<main className="animate-fade-in-up">
<section className="animate-fade-in-up delay-200">

// Background decorative blurs
<div className="bg-indigo-500/10 blur-[120px] animate-fade-in" />
```

#### Layout Patterns
- **Public Pages**: Standalone with gradient backgrounds
- **Protected Pages**: Floating sidebar (`AppSidebar`) with user profile
- **Content**: `max-w-7xl mx-auto` containers

### State Management

- **Authentication**: Supabase client context
- **Theme**: ThemeProvider context
- **API Calls**: Centralized `api.ts` client with typed methods

---

## Development Setup

### Prerequisites

- **Node.js** 18+ (for frontend + backend)
- **Python** 3.11+ (for FastAPI backend)
- **PostgreSQL** (via Supabase)
- **MongoDB** (local or Atlas)
- **Qdrant** (Docker recommended)
- **Cloudflare R2** account
- **Supabase** project

### Environment Configuration

#### FastAPI Backend (`.env`)
```bash
PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=adept_ai

# Cloudflare R2
CLOUDFLARE_S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name

# Qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6333
EMBEDDING_MODEL=all-MiniLM-L6-v2

# AI/LLM
GROQ_API_KEY=your_groq_api_key
```

#### Frontend (`.env`)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3000
```

### Installation & Running

#### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# FastAPI Backend
cd fastapi-backend
pip install -e .
# or with uv:
uv sync
```

#### 2. Start Qdrant (Docker)

```bash
docker run -p 6333:6333 \
  -v $(pwd)/qdrant-vector-store:/qdrant/storage \
  qdrant/qdrant
```

#### 3. Run Development Servers

```bash
# Terminal 1: FastAPI Backend
cd fastapi-backend
uvicorn main:app --reload --port 3000
# Or: python main.py
# Runs on http://localhost:3000 (or PORT from .env)

# Terminal 2: Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

#### 4. Database Setup

```bash
# Ensure MongoDB is running
mongod --dbpath /path/to/data/db

# Supabase schema is managed via Supabase dashboard
# Run migrations if you have them set up
```

---

## File Upload Flow

### Document Upload Process

1. **Frontend**: User selects PDF via file input (max 10MB)
2. **FastAPI Backend**: Receives file upload via multipart/form-data
3. **Validation**: Check `content_type === 'application/pdf'`
4. **Temporary Storage**: Save to `temp/` directory
5. **Database**: Create document record in Supabase
6. **Storage**: Upload to R2 at `documents/{document_id}.pdf`
7. **Response**: Return document metadata to frontend
8. **Text Extraction**: PyMuPDF extracts text from all pages
9. **Chunking**: LangChain splits text into semantic chunks
10. **Embeddings**: Generate 384-dim vectors with SentenceTransformer
11. **Vector Store**: Insert embeddings into Qdrant with metadata

### File Storage Structure (R2)

```
bucket/
  documents/
    {uuid-1}.pdf
    {uuid-2}.pdf
    ...
```

---

## Authentication Flow

### Registration
1. Frontend submits `{ email, password, full_name, role }` to FastAPI `/auth/register`
2. Backend creates Supabase auth user
3. Backend creates profile record in `profiles` table
4. Returns session tokens to frontend

### Login
1. Frontend calls `supabase.auth.signInWithPassword({ email, password })`
2. Supabase returns JWT access token + refresh token
3. Frontend stores session in localStorage (managed by Supabase client)

### Protected Routes
1. Frontend includes JWT in `Authorization: Bearer {token}` header
2. Backend `authMiddleware` verifies token with Supabase
3. Extracts user from token, attaches to `req.user`
4. Controllers access `req.user.id` for user-scoped operations

---

## Key Features & User Flows

### 1. Document Discovery
- Browse documents by university → department → course
- Search documents by title
- Filter by unit/chapter number
- View uploader information and metadata

### 2. Library Management
- Create personal libraries for organizing documents
- Add documents from any course to your library
- Remove documents from libraries
- Share library structure (future feature)

### 3. AI Chat with Documents
- **Start Chat**: Select document from library or documents page
- **View PDF**: Side-by-side PDF viewer with page navigation
- **Ask Questions**: Natural language queries about document content
- **Multi-Document**: Add up to 5 PDFs to single chat session
- **Context-Aware**: AI responses grounded in document content
- **Chat History**: Persistent conversation threads

### 4. Collaborative Learning
- Students upload lecture notes, textbooks, assignments
- Documents organized by course structure
- Anyone can add documents to their library
- Cross-course document sharing via libraries

---

## AI/ML Technical Details

### Embedding Model
- **Model**: `all-MiniLM-L6-v2` (SentenceTransformers)
- **Dimensions**: 384
- **Purpose**: Fast, efficient sentence embeddings
- **Performance**: ~120ms per 512-token chunk on CPU
- **License**: Apache 2.0

### Text Chunking Strategy
- **Method**: RecursiveCharacterTextSplitter (LangChain)
- **Chunk Size**: 500-1000 tokens (configurable)
- **Overlap**: 50-100 tokens (prevents context loss)
- **Separators**: Paragraph breaks → sentences → words

### Vector Search
- **Engine**: Qdrant
- **Distance Metric**: COSINE similarity
- **Index**: HNSW (Hierarchical Navigable Small World)
- **Query Time**: ~5-10ms for top-5 retrieval
- **Scalability**: Handles millions of vectors

### LLM Integration
- **Provider**: Groq (ultra-fast inference)
- **Models**: Llama 3, Mixtral (configurable)
- **Context Window**: 4096+ tokens
- **Speed**: ~500 tokens/second
- **Cost**: Pay-per-token

### RAG Prompt Template
```
You are an AI assistant helping students understand their course materials.

Context from documents:
{retrieved_chunks}

Student question:
{user_query}

Provide a clear, accurate answer based on the context above. If the answer isn't in the context, say so.
```

---

## Future Enhancements

### Short-term
- [ ] Streaming AI responses with SSE/WebSocket
- [ ] Citation system (link responses to specific PDF pages)
- [ ] Document preview thumbnails
- [ ] Advanced search filters (date, uploader, tags)
- [ ] Chat export (PDF, Markdown)

### Medium-term
- [ ] Multimodal processing (images, tables, equations in PDFs)
- [ ] Voice input/output for accessibility
- [ ] Collaborative chat rooms (multiple users, same document)
- [ ] Document versioning and diff viewer
- [ ] Analytics dashboard (most viewed documents, popular questions)

### Long-term
- [ ] Custom fine-tuned models per university/course
- [ ] Auto-generated study guides and summaries
- [ ] Integration with assignment submission systems
- [ ] Mobile app (React Native)
- [ ] Offline mode with local vector store

---

## Performance Considerations

### Scalability
- **Documents**: R2 scales infinitely, PostgreSQL handles 1M+ records easily
- **Embeddings**: Qdrant clusters support billions of vectors
- **Concurrent Users**: FastAPI async handling + connection pooling
- **LLM Requests**: Groq provides extremely fast inference (~500 tok/s)

### Optimization Strategies
- **Chunking**: Pre-compute embeddings at upload time (not query time)
- **Caching**: Redis layer for frequently accessed documents (future)
- **CDN**: Serve PDFs from R2 with CloudFlare CDN
- **Lazy Loading**: Frontend pagination for document lists
- **Connection Pooling**: Database connection reuse

### Cost Management
- **Storage**: R2 pricing competitive with S3 (~$0.015/GB/month)
- **LLM**: Groq offers generous free tier + low per-token costs
- **Embeddings**: Local SentenceTransformers = no API costs
- **Database**: Supabase free tier sufficient for prototype, scalable beyond

---

## Security & Privacy

### Authentication
- JWT-based auth with Supabase (industry standard)
- Secure password hashing (bcrypt via Supabase)
- Session management with refresh tokens

### Authorization
- User-scoped queries (always filter by `user_id`)
- Document ownership verification before deletion
- Library privacy (only owner can modify)
- Chat access control (only creator can view)

### Data Protection
- PDFs stored in private R2 bucket (no public URLs)
- Pre-signed URLs for temporary access (future)
- Environment variables for sensitive keys
- HTTPS in production (enforced by CloudFlare)

### GDPR Compliance (Future)
- User data export functionality
- Right to deletion (cascade delete user data)
- Data retention policies
- Privacy policy and terms of service

---

## Deployment Guide

### Production Checklist

1. **Environment Variables**
   - Store secrets in secure vault (AWS Secrets Manager, Doppler)
   - Separate `.env` files for dev/staging/prod

2. **Database**
   - Supabase production project with connection pooling
   - MongoDB Atlas cluster with replica sets
   - Regular backups configured

3. **File Storage**
   - Cloudflare R2 production bucket with CORS configured
   - CDN setup for PDF delivery

4. **Vector Store**
   - Qdrant Cloud cluster or self-hosted with persistent volumes
   - Backup vector collections regularly

5. **Backend Service**
   - FastAPI: Deploy to Railway, Render, Fly.io, or AWS Lambda (with Mangum adapter)

6. **Frontend**
   - Build: `npm run build` (outputs to `dist/`)
   - Deploy to Vercel, Netlify, or CloudFlare Pages
   - Configure environment variables in platform

7. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring (New Relic, DataDog)
   - Log aggregation (CloudWatch, Logtail)

### Docker Deployment (Optional)

```dockerfile
# FastAPI Backend
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml ./
RUN pip install -e .
COPY . .
EXPOSE 3000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]

# Frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

---

## Code Conventions

### Frontend (TypeScript)
- **Path Alias**: `@/` mapped to `src/`
  ```typescript
  import { Button } from "@/components/ui/button";
  ```
- **Class Merging**: `cn()` utility from `lib/utils.ts`
  ```typescript
  <div className={cn("base-class", condition && "conditional-class")} />
  ```

### Backend (Python)
- **Type Hints**: Use Pydantic models for request/response validation
- **Async**: Use async/await for I/O operations
- **Dependencies**: Use FastAPI dependency injection for auth, database connections

---

## Error Handling

### Backend Error Pattern
```python
from fastapi import HTTPException

# Raise HTTP exceptions
raise HTTPException(status_code=400, detail="No file uploaded")

# Use dependency injection for auth
@router.get("/")
def endpoint(current_user=Depends(get_current_user)):
    # Handle request
    pass
```

### Frontend Error Pattern
```typescript
try {
  const result = await api.uploadDocument(formData);
  toast.success("Document uploaded successfully!");
} catch (error) {
  toast.error(error.message || "Upload failed");
}
```

---

## Contributing Guidelines

### Code Style
- **TypeScript**: Follow ESLint rules, use strict typing
- **Python**: Follow PEP 8, use type hints
- **React**: Functional components, hooks-based
- **Naming**: camelCase (JS/TS), snake_case (Python), kebab-case (files)

### Git Workflow
1. Create feature branch: `git checkout -b feature/chat-streaming`
2. Commit with conventional commits: `feat: add streaming responses`
3. Push and create pull request
4. Squash merge to main

### Testing (Future)
- **Unit Tests**: Jest (frontend), pytest (backend)
- **Integration Tests**: Supertest (Express), TestClient (FastAPI)
- **E2E Tests**: Playwright

---

## Troubleshooting

### Common Issues

#### "Qdrant connection refused"
- Ensure Qdrant is running: `docker ps | grep qdrant`
- Check `QDRANT_HOST` and `QDRANT_PORT` in `.env`

#### "Supabase auth error"
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project dashboard for service status

#### "File upload fails"
- Confirm R2 credentials in `.env`
- Check bucket CORS settings in Cloudflare dashboard
- Verify file size < 10MB

#### "AI responses are slow"
- Check Groq API quota/limits
- Consider local LLM deployment (Ollama) for development
- Verify network latency to Groq API

---

## License

This project is proprietary. All rights reserved.

---

## Contact & Support

For questions or issues:
- **GitHub Issues**: Create an issue in the repository
- **Email**: support@adept-ai.example.com (placeholder)
- **Documentation**: See inline code comments and this README

---

## Appendix: Prompt for LLM Understanding

**If providing this README as context to an LLM:**

This document describes Adept AI, a full-stack educational platform with two main components:

1. **FastAPI Backend** (Python): Unified backend handling authentication, CRUD operations for universities/departments/courses/documents/libraries, file uploads to Cloudflare R2, and AI service implementing RAG (Retrieval-Augmented Generation) for chatting with PDF documents using LangChain, Qdrant vector store, and Groq LLM
2. **React Frontend** (TypeScript + Vite): User interface with document browsing, library management, and AI chat interface with PDF viewer

**Key Technologies:**
- Supabase (auth + PostgreSQL database)
- Cloudflare R2 (S3-compatible PDF storage)
- Qdrant (vector database for embeddings)
- SentenceTransformers (text embeddings)
- Groq (fast LLM inference)
- MongoDB (chat history)

**Main User Flow:**
1. User uploads PDF to a course
2. System extracts text, generates embeddings, stores in vector database
3. User creates chat session with document(s)
4. User asks questions → System retrieves relevant chunks → LLM generates grounded response

**Architecture:** Three-tier (React → FastAPI → Supabase/MongoDB/Qdrant/R2)

The FastAPI backend is a unified service handling both traditional CRUD operations and AI/ML operations including document processing, vector embeddings, and chat-based RAG functionality.
