# Adept-AI Project Documentation for AI Agents

> **Last Updated**: January 30, 2026
>
> **Project Type**: Learning Management System (LMS) with RAG-powered AI Chat

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Architecture](#project-architecture)
3. [Backend Specification](#backend-specification)
4. [Frontend Specification](#frontend-specification)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Design System & UI Guidelines](#design-system--ui-guidelines)
8. [Feature Requirements](#feature-requirements)
9. [Development Workflow](#development-workflow)
10. [Environment Variables](#environment-variables)

---

## Project Overview

### Vision

Adept-AI is a Learning Management System designed for students to:

- **Authenticate** and access personalized dashboards
- **Browse Library** of educational documents (notes, slides, textbooks) organized by courses and departments
- **Curate Collections** by saving documents to their personal library
- **Chat with Documents** using a RAG (Retrieval-Augmented Generation) chatbot to interact with their saved materials

### Key Differentiators

- Document-centric approach with personal collections
- AI-powered document interaction via RAG chatbot
- Course and department-based organization
- PDF document management with S3 storage

---

## Project Architecture

### Monorepo Structure

```
Adept-AI/
├── backend/          # Express.js API server
├── frontend/         # React SPA with Vite
└── agents.md         # This file
```

### Tech Stack Summary

| Layer                 | Technologies                                          |
| --------------------- | ----------------------------------------------------- |
| **Backend Runtime**   | Node.js with TypeScript (ESNext, NodeNext modules)    |
| **Backend Framework** | Express.js v5.2.1                                     |
| **Database**          | Supabase (PostgreSQL) with Supabase Auth              |
| **File Storage**      | Cloudflare R2 (S3-compatible) for PDF documents       |
| **Frontend Runtime**  | React 19.2.0 with TypeScript                          |
| **Build Tool**        | Vite 7.2.4                                            |
| **Routing**           | React Router DOM v7.13.0                              |
| **UI Framework**      | shadcn/ui (Base-Vega style) with Tailwind CSS v4.1.17 |
| **HTTP Client**       | Axios v1.13.4                                         |
| **Icons**             | Tabler Icons React v3.36.1                            |
| **Animations**        | tw-animate-css v1.4.0                                 |
| **Fonts**             | Noto Sans (Variable font from Fontsource)             |

---

## Backend Specification

### Directory Structure

```
backend/
├── src/
│   ├── app.ts                    # Express app entry point
│   ├── controllers/              # Request handlers
│   │   ├── authController.ts
│   │   ├── courseController.ts
│   │   ├── deptController.ts
│   │   ├── documentController.ts
│   │   └── profileController.ts
│   ├── middlewares/              # Express middlewares
│   │   ├── authMiddleware.ts     # JWT Bearer token validation
│   │   ├── errorHandler.ts       # Global error handler
│   │   └── fileUpload.ts         # Multer file upload config
│   ├── routes/                   # Route definitions
│   │   ├── authRoutes.ts
│   │   ├── courseRoutes.ts
│   │   ├── deptRoutes.ts
│   │   ├── documentRoutes.ts
│   │   └── profileRoutes.ts
│   ├── types/                    # TypeScript type definitions
│   │   ├── apiError.types.ts
│   │   ├── database.types.ts     # Auto-generated from Supabase
│   │   └── express.d.ts
│   └── utils/                    # Utility modules
│       ├── asyncHandler.ts       # Async error wrapper
│       ├── dbClient.ts           # Supabase client instance
│       └── s3Client.ts           # S3/R2 client for file operations
├── package.json
├── tsconfig.json
└── API_DOCUMENTATION.md          # Complete API reference
```

### Key Dependencies

```json
{
  "@aws-sdk/client-s3": "^3.975.0",
  "@supabase/supabase-js": "^2.91.1",
  "dotenv": "^17.2.3",
  "express": "^5.2.1",
  "multer": "^2.0.2",
  "typescript": "^5.9.3"
}
```

### TypeScript Configuration

- **Module System**: ESNext with NodeNext module resolution
- **Target**: ESNext
- **Strict Mode**: Enabled with additional strictness:
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
  - `noImplicitReturns: true`
  - `noImplicitOverride: true`
  - `noUnusedLocals: true`
- **Output**: Compiled to `dist/` directory with source maps

### Authentication

- **Provider**: Supabase Auth (JWT-based)
- **Registration Flow**:
  - Frontend → Backend API (`POST /auth/register`)
  - Backend creates Supabase user and profile
  - User then logs in via Supabase in frontend
- **Login/Logout**: Handled via Supabase client SDK (`@supabase/supabase-js`) in frontend
- **Backend**: `authMiddleware.ts` validates Bearer tokens from Supabase
- **Token Format**: `Authorization: Bearer <jwt_token>`
- **Protected Routes**: `/profiles/*`, `/documents/*`, `/library/*`

### File Upload

- **Library**: Multer v2.0.2
- **Max File Size**: 10 MB
- **Allowed Types**: PDF only (`application/pdf`)
- **Storage**: Cloudflare R2 (S3-compatible API)
- **Operations**: Upload (`putObject`), Delete (`deleteObject`)

### Scripts

```bash
npm run dev      # Compile TypeScript and run with --watch
npm run schema   # Generate database types from Supabase
```

---

## Frontend Specification

### Directory Structure

```
frontend/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Root component with routing
│   ├── index.css             # Global styles with Tailwind imports
│   ├── lib/
│   │   └── utils.ts          # Utility functions (cn helper)
│   └── components/           # React components (to be created)
│       └── ui/               # shadcn/ui components
├── components.json           # shadcn/ui configuration
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
└── index.html
```

### Key Dependencies

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.0",
  "axios": "^1.13.4",
  "@supabase/supabase-js": "^2.x" (to be installed),
  "tailwindcss": "^4.1.17",
  "@tailwindcss/vite": "^4.1.17",
  "shadcn": "^3.7.0",
  "@tabler/icons-react": "^3.36.1",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "tw-animate-css": "^1.4.0",
  "@fontsource-variable/noto-sans": "^5.2.10"
}
```

**Note**: Install `@supabase/supabase-js` for frontend authentication

### shadcn/ui Configuration

```json
{
  "style": "base-vega",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "tabler",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Styling Approach

- **Tailwind CSS v4**: Imported via `@import "tailwindcss"` in index.css
- **shadcn/ui**: Base-Vega style with CSS variables for theming
- **Color System**: Neutral base color with OKLCH color space
- **Typography**: Noto Sans variable font
- **Icons**: Tabler Icons (outlined style)
- **Animations**: tw-animate-css for pre-built animation utilities
- **Dark Mode**: Supported via `.dark` class (`:is(.dark *)` variant)

### Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

---

## Database Schema

### Tables

#### 1. `users` (Managed by Supabase Auth)

Authentication is handled by Supabase Auth. User records are automatically created.

#### 2. `profiles`

User profile information linked to auth users.

| Column       | Type          | Constraints           | Description                  |
| ------------ | ------------- | --------------------- | ---------------------------- |
| `user_id`    | `uuid`        | PRIMARY KEY, NOT NULL | Links to Supabase auth.users |
| `full_name`  | `text`        | NOT NULL, DEFAULT ''  | User's full name             |
| `dept_id`    | `uuid`        | FOREIGN KEY, NULLABLE | Links to departments table   |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT NOW | Creation timestamp           |

**Relationships**:

- Many-to-One with `departments` (via `dept_id`)

#### 3. `departments`

Academic departments.

| Column         | Type          | Constraints       | Description             |
| -------------- | ------------- | ----------------- | ----------------------- |
| `id`           | `uuid`        | PRIMARY KEY       | Department ID           |
| `name`         | `text`        | NOT NULL, UNIQUE  | Department name         |
| `abbreviation` | `text`        | NULLABLE          | Short code (e.g., "CS") |
| `created_at`   | `timestamptz` | NOT NULL, DEFAULT | Creation timestamp      |

#### 4. `courses`

Academic courses.

| Column       | Type          | Constraints       | Description                 |
| ------------ | ------------- | ----------------- | --------------------------- |
| `id`         | `uuid`        | PRIMARY KEY       | Course ID                   |
| `code`       | `text`        | NOT NULL, UNIQUE  | Course code (e.g., "CS101") |
| `name`       | `text`        | NULLABLE          | Course name                 |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT | Creation timestamp          |

#### 5. `provided_by` (Junction Table)

Many-to-many relationship between courses and departments.

| Column       | Type          | Constraints           | Description          |
| ------------ | ------------- | --------------------- | -------------------- |
| `course_id`  | `uuid`        | FOREIGN KEY, NOT NULL | Links to courses     |
| `dept_id`    | `uuid`        | FOREIGN KEY, NOT NULL | Links to departments |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT     | Creation timestamp   |

**Composite Primary Key**: (`course_id`, `dept_id`)

#### 6. `documents`

PDF documents stored in S3.

| Column       | Type          | Constraints           | Description         |
| ------------ | ------------- | --------------------- | ------------------- |
| `id`         | `uuid`        | PRIMARY KEY           | Document ID         |
| `title`      | `text`        | NULLABLE              | Document title      |
| `unit`       | `integer`     | NULLABLE              | Unit/chapter number |
| `course_id`  | `uuid`        | FOREIGN KEY, NOT NULL | Associated course   |
| `user_id`    | `uuid`        | FOREIGN KEY, NULLABLE | User who uploaded   |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT     | Upload timestamp    |

**Relationships**:

- Many-to-One with `courses` (via `course_id`)
- Many-to-One with `users` (via `user_id`)

**Note**: The S3 storage key is typically `documents/{document_id}.pdf`

#### 7. `library` (User Collections)

Junction table for user's personal document collections.

| Column        | Type          | Constraints           | Description                 |
| ------------- | ------------- | --------------------- | --------------------------- |
| `id`          | `uuid`        | PRIMARY KEY           | Library entry ID            |
| `user_id`     | `uuid`        | FOREIGN KEY, NOT NULL | User who saved the document |
| `document_id` | `uuid`        | FOREIGN KEY, NOT NULL | Saved document              |
| `created_at`  | `timestamptz` | NOT NULL, DEFAULT     | When document was saved     |

**Relationships**:

- Many-to-One with `profiles` (via `user_id`)
- Many-to-One with `documents` (via `document_id`)

**Note**: This table represents a user's personal library/collection of saved documents.

---

## API Reference

### Base URL

```
http://localhost:{PORT}
```

**Note**: PORT is defined in backend `.env` file.

### Authentication

Protected routes require JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Routes Summary

| Method   | Endpoint               | Auth Required | Description                     |
| -------- | ---------------------- | ------------- | ------------------------------- |
| `POST`   | `/auth/register`       | ❌            | Register new user               |
| `DELETE` | `/auth/:id`            | ❌            | Delete user account             |
| `GET`    | `/profiles/:id`        | ✅            | Get user profile                |
| `PATCH`  | `/profiles/:id`        | ✅            | Update user profile             |
| `GET`    | `/courses`             | ❌            | Get all courses                 |
| `GET`    | `/courses/:courseId`   | ❌            | Get course by ID                |
| `POST`   | `/courses`             | ❌            | Create new course               |
| `PATCH`  | `/courses/:courseId`   | ❌            | Update course                   |
| `DELETE` | `/courses/:courseId`   | ❌            | Delete course                   |
| `POST`   | `/courses/providedBy`  | ❌            | Assign course to department     |
| `GET`    | `/departments`         | ❌            | Get all departments             |
| `GET`    | `/departments/:deptId` | ❌            | Get department by ID            |
| `POST`   | `/departments`         | ❌            | Create new department           |
| `PATCH`  | `/departments/:deptId` | ❌            | Update department               |
| `DELETE` | `/departments/:deptId` | ❌            | Delete department               |
| `POST`   | `/documents`           | ✅            | Upload PDF document             |
| `GET`    | `/documents/:id`       | ✅            | Get document by ID              |
| `PATCH`  | `/documents/:id`       | ✅            | Update document metadata        |
| `DELETE` | `/documents/:id`       | ✅            | Delete document from DB & S3    |
| `GET`    | `/library`             | ✅            | Get user's saved documents      |
| `POST`   | `/library`             | ✅            | Add document to collection      |
| `DELETE` | `/library/:docId`      | ✅            | Remove document from collection |

**Note**: Full API documentation with request/response schemas is available in `backend/API_DOCUMENTATION.md`.

### Missing Endpoints (To Be Implemented)

1. **GET `/documents`** - List all documents (with optional filters by course/department)
2. **POST `/chat`** - RAG chat endpoint for document queries
3. **GET `/chat/history`** - Get chat history

### Authentication Note

- **Registration**: Uses backend API `POST /auth/register` (backend creates user in Supabase)
- **Login/Logout**: Handled entirely in the frontend using Supabase Auth client SDK
- No backend `/auth/login` endpoint is needed
- Backend only validates JWT tokens via `authMiddleware.ts`

## Design System & UI Guidelines

### Color Palette

Using OKLCH color space for perceptually uniform colors:

- **Background**: `oklch(1 0 0)` (white) / `oklch(0.145 0 0)` (dark)
- **Foreground**: `oklch(0.145 0 0)` (near-black) / `oklch(0.985 0 0)` (near-white)
- **Primary**: `oklch(0.205 0 0)` - Main brand color
- **Muted**: `oklch(0.97 0 0)` - Subtle backgrounds
- **Border**: `oklch(0.922 0 0)` - Light gray borders
- **Destructive**: `oklch(0.58 0.22 27)` - Red for destructive actions

### Typography

- **Font Family**: Noto Sans (Variable)
- **Font Loading**: Via `@fontsource-variable/noto-sans`
- **Approach**: System font stack fallback

### Component Library

- **Framework**: shadcn/ui (Base-Vega style)
- **Installation**: Use `npx shadcn@latest add <component-name>`
- **Customization**: Components are copied to `src/components/ui/` and fully customizable
- **Icon Library**: Tabler Icons (`@tabler/icons-react`)

### Layout Patterns

#### Public Layout (Unauthenticated)

- Minimal header with logo + CTA buttons (Login/Register)
- Full-width content area
- Optional footer

#### Protected Layout (Authenticated)

- **Sidebar Navigation**: Fixed left sidebar with menu items
  - Dashboard
  - Library
  - My Collection
  - Chat
  - Profile
- **Top Header**: User menu, notifications, search (optional)
- **Content Area**: Main content with padding
- **Responsive**: Collapse sidebar to hamburger on mobile

### Responsive Breakpoints

Tailwind default breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Animation Guidelines

- Use `tw-animate-css` for standard animations (fade, slide, bounce)
- Keep animations subtle and fast (200-300ms)
- Respect `prefers-reduced-motion` for accessibility

---

## Feature Requirements

### Multi-Page Website Structure

#### 1. Landing Page (`/`)

**Purpose**: Marketing page for unauthenticated users

**Sections**:

- Hero section with tagline and CTA ("Get Started", "Login")
- Features overview (Library, Collections, AI Chat)
- How it works (3-step process)
- Footer with links

**Components Needed**:

- Hero component
- Feature cards
- CTA buttons
- Navigation header (public)

---

#### 2. Login Page (`/login`)

**Purpose**: User authentication via Supabase Auth

**Features**:

- Email input
- Password input (with show/hide toggle)
- "Remember me" checkbox (optional)
- Login button
- Link to Register page
- "Forgot password?" link (optional)

**Authentication Method**: Supabase Client SDK

```typescript
// Example: supabase.auth.signInWithPassword({ email, password })
```

**On Success**:

- Store session token
- Redirect to `/dashboard`

---

#### 3. Register Page (`/register`)

**Purpose**: New user registration

**Features**:

- Email input with validation
- Password input with strength indicator
- Confirm password input
- Register button
- Link to Login page

**Authentication Method**: Backend API

```typescript
// Backend API call only
// POST /auth/register { email, password }
// Backend handles Supabase user creation and profile setup
```

**On Success**:

- Show success message
- Redirect to `/login` page
- User logs in with Supabase Auth client

---

#### 4. Dashboard (`/dashboard`)

**Purpose**: Personalized overview after login

**Protected Route**: Requires authentication

**Features**:

- Welcome message with user name
- Statistics cards:
  - Total documents in library
  - Documents in my collection
  - Recent chats
- Quick actions:
  - Browse Library
  - Upload Document
  - Start Chat
- Recent activity feed:
  - Recently added documents
  - Recent chat sessions

**API Calls**:

- `GET /documents` (count, recent)
- `GET /library` (count)
- `GET /chat/history` (recent sessions)

---

#### 5. Library Page (`/library`)

**Purpose**: Browse all available documents

**Protected Route**: Requires authentication

**Features**:

- Filter sidebar:
  - By department
  - By course
  - By unit number
- Search bar (fuzzy search by title)
- Grid/List view toggle
- Document cards with:
  - Thumbnail (PDF icon or first page)
  - Title
  - Course code/name
  - Unit number
  - "Add to Collection" button
  - "Preview" button
- Pagination or infinite scroll

**API Calls**:

- `GET /documents` (with filters)
- `GET /courses`
- `GET /departments`
- `POST /library` (add to collection)

---

#### 6. Document View Page (`/library/:documentId`)

**Purpose**: Detailed view of a single document

**Protected Route**: Requires authentication

**Features**:

- Document metadata:
  - Title
  - Course
  - Unit
  - Uploader (optional)
  - Upload date
- PDF preview (embedded viewer or link to S3)
- Actions:
  - Add/Remove from Collection
  - Download PDF
  - Start Chat with this document
- Related documents (same course/unit)

**API Calls**:

- `GET /documents/:id`
- `POST /library` or `DELETE /library/:docId`
- `GET /documents?courseId={courseId}` (related docs)

---

#### 7. My Collection (`/collection`)

**Purpose**: User's saved documents

**Protected Route**: Requires authentication

**Features**:

- Similar to Library page but only shows user's saved docs
- Ability to remove documents from collection
- Search within collection
- Filter by course/department
- "Chat with all documents" button

**API Calls**:

- `GET /library` (user's saved documents)
- `DELETE /library/:docId` (remove from collection)

---

#### 8. Chat Page (`/chat`)

**Purpose**: RAG-powered chatbot interface

**Protected Route**: Requires authentication

**Features**:

- Chat interface:
  - Message history (scrollable)
  - Input field with send button
  - "New Chat" button to start fresh session
- Document context sidebar:
  - List of documents being used for RAG context
  - Ability to add/remove documents from current chat
- Chat history dropdown (previous sessions)
- Message bubbles:
  - User messages (right-aligned, primary color)
  - AI responses (left-aligned, muted color)
  - Citations/references to source documents
- Streaming responses (optional but recommended)

**API Calls**:

- `POST /chat` (send message, get response)
- `GET /chat/history` (load previous sessions)
- `GET /chat/:sessionId` (load specific session)
- `GET /library` (to select context documents)

---

#### 9. Profile Page (`/profile`)

**Purpose**: View and edit user profile

**Protected Route**: Requires authentication

**Features**:

- Profile information:
  - Full name (editable)
  - Email (display only)
  - Department (dropdown to change)
  - Account creation date
- Edit mode toggle
- Save changes button
- Change password section (optional)
- Logout button (uses Supabase `auth.signOut()`)

**API Calls**:

- `GET /profiles/:id`
- `PATCH /profiles/:id` (update fullName, department)
- `GET /departments` (for dropdown)

---

### User Flows

#### First-Time User Flow

1. Land on `/` (Landing Page)
2. Click "Get Started" → `/register`
3. Register via backend API → Redirect to `/login`
4. Login using Supabase Auth → `/dashboard`
5. See onboarding tips or tutorial
6. Navigate to `/library` to explore documents
7. Add documents to collection
8. Go to `/chat` to interact with documents

#### Returning User Flow

1. Navigate to `/login`
2. Login → `/dashboard`
3. See recent activity
4. Quick actions to Library or Chat

---

## Development Workflow

### Backend Development

1. **Database Changes**:
   - Make schema changes in Supabase dashboard
   - Run `npm run schema` to regenerate types
   - Update controllers/routes as needed

2. **Adding New Endpoints**:
   - Create controller function in `src/controllers/`
   - Define route in `src/routes/`
   - Add authentication middleware if needed
   - Update `API_DOCUMENTATION.md`

3. **Testing**:
   - Use tools like Postman or Bruno
   - Test with/without auth tokens
   - Verify error handling

### Frontend Development

1. **Adding Pages**:
   - Create component in `src/pages/` (to be created)
   - Add route in `App.tsx` with React Router
   - Use protected route wrapper for auth-required pages

2. **Adding shadcn Components**:

   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add dialog
   # etc.
   ```

3. **API Integration**:
   - Create API client in `src/lib/api.ts` (to be created)
   - Use Axios with interceptors for auth headers
   - Handle loading states and errors

4. **State Management**:
   - Use React Context for global state (user, auth)
   - Use local state (useState) for component-specific data
   - Consider React Query for server state (optional)

### Code Style

- **Formatting**: Prettier is configured
- **Linting**: ESLint with React hooks rules
- **TypeScript**: Strict mode enabled
- **Naming Conventions**:
  - React components: PascalCase
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case or PascalCase (components)

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=3000

# Supabase
DATABASE_URL=https://your-project.supabase.co
DATABASE_API_KEY=your-supabase-anon-key

# Cloudflare R2 (S3-compatible)
CLOUDFLARE_S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
```

### Frontend `.env`

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000

# Optional: Other config
VITE_APP_NAME=Adept-AI
```

---

## Known Gaps & Future Enhancements

### Backend Gaps

1. **Document Listing**: `GET /documents` with filters needed
2. **RAG/Chat Endpoints**: Integration with LLM and vector database
3. **Search**: Full-text search across documents
4. **Pagination**: Implement pagination for large result sets
5. **Library Routes Not Registered**: Need to add library routes to `app.ts`

### Frontend Gaps

1. **No Pages Created Yet**: All pages need to be built from scratch
2. **No API Client**: Need to create Axios client with auth interceptors
3. **No Auth Context**: Need global auth state management
4. **No Protected Routes**: Need route guards for authenticated pages

### Future Features

- **Multi-document Chat**: Chat with multiple documents simultaneously
- **Document Annotations**: Highlight and annotate PDFs
- **Collaborative Collections**: Share collections with other users
- **Advanced Filters**: More granular search and filtering
- **Analytics**: Track document usage and chat metrics
- **Admin Dashboard**: Manage users, courses, departments
- **Notifications**: Real-time notifications for new documents
- **Mobile App**: React Native version

---

## AI Agent Instructions

When working on this project:

1. **Always refer to API_DOCUMENTATION.md** for complete API specifications
2. **Use TypeScript strictly** - leverage the auto-generated database types
3. **Follow shadcn/ui patterns** - install components via CLI, customize as needed
4. **Maintain consistency**:
   - Use the same color system (OKLCH)
   - Follow Tailwind utility-first approach
   - Use Tabler Icons exclusively
5. **Authentication**:
   - Use Supabase Auth client SDK for login/logout/register
   - Supabase manages session tokens automatically
   - Get session token via `supabase.auth.getSession()`
   - Add token to Axios default headers for API calls
   - No need to create custom login/logout endpoints
6. **Error Handling**:
   - Display user-friendly error messages
   - Log errors for debugging
   - Use try-catch blocks consistently
7. **Accessibility**:
   - Use semantic HTML
   - Add ARIA labels where needed
   - Ensure keyboard navigation works
8. **Performance**:
   - Lazy load routes
   - Optimize images/PDFs
   - Implement pagination for large datasets
9. **Code Organization**:
   - Keep components small and focused
   - Extract reusable logic into custom hooks
   - Use barrel exports (index.ts) for clean imports

---

## Quick Reference Commands

### Backend

```bash
cd backend
npm install
npm run dev              # Start dev server with watch mode
npm run schema           # Regenerate database types
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # Start Vite dev server
npx shadcn@latest add <component>  # Add shadcn component
```

---

**End of Agent Documentation**
