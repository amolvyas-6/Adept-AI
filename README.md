# Adept AI - Educational Document Management & AI Chat Platform

Adept AI is a comprehensive Learning Management System (LMS) that enables students and educators to organize, share, and interact with academic documents through an intelligent AI-powered chat interface. The platform combines traditional document management with cutting-edge Retrieval-Augmented Generation (RAG) technology, allowing users to have natural conversations with their PDF documents.

## System Architecture

The application follows a modern three-tier architecture with a React frontend and a FastAPI backend:

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
│    Backend     │  │  (Auth + DB +   │  │  (Chat Store)     │
│  (Python 3.11) │  │   Storage)      │  │                   │
└───────┬────────┘  └─────────────────┘  └───────────────────┘
        │
        ├──────────────────┬──────────────────────┐
        │                  │                      │
┌───────▼────────┐  ┌──────▼─────────┐  ┌────────▼──────────┐
│  Supabase S3   │  │    Qdrant      │  │   Groq API        │
│  (Storage)     │  │ Vector Store   │  │  (LLM Inference)  │
│  PDF Files     │  │  Embeddings    │  │                   │
└────────────────┘  └────────────────┘  └───────────────────┘
```

## Key Features

- **Document Management**: Upload, organize, and share academic PDFs by university, department, and course
- **AI-Powered Chat**: Ask questions and get intelligent responses from your documents using multimodal RAG
- **Library System**: Create personal libraries to curate relevant documents
- **Collaborative Learning**: Share documents across courses and departments for collective learning

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI primitives
- **Backend**: FastAPI (Python 3.11+), Supabase Auth, PostgreSQL, MongoDB, Qdrant Vector Store
- **AI/ML**: LangChain, Sentence Transformers (all-MiniLM-L6-v2), Groq API (LLM inference)
- **Storage**: Supabase Storage (S3-compatible API)

## Development Setup

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** (via Supabase)
- **MongoDB** (local or Atlas)
- **Qdrant** (Docker recommended)
- **Supabase** project (Storage enabled)
- **Groq API** key

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

# Terminal 2: Frontend
cd frontend
npm run dev
```

## License

This project is proprietary. All rights reserved.
