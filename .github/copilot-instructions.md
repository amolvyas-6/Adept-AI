# Adept AI - Copilot Instructions

## Project Overview

Educational document management platform (LMS) with a TypeScript Express backend and React (Vite) frontend. Uses **Supabase** for auth/database and **Cloudflare R2** (S3-compatible) for file storage.

## Architecture

### Backend (`/backend`)

- **Express 5** REST API with TypeScript (ES modules - use `.js` extensions in imports)
- **Supabase** handles both authentication and PostgreSQL database
- **Cloudflare R2** for PDF document storage via AWS S3 SDK
- Routes: `/auth`, `/profiles`, `/documents`, `/courses`, `/departments`, `/libraries`

### Frontend (`/frontend`)

- **React 19 + Vite + TypeScript** with **Tailwind CSS v4**
- **shadcn/ui** (`radix-vega` style) components in `src/components/ui/`
- **react-hook-form + zod** for form validation
- **Supabase client** handles login directly; registration goes through backend API

## Development Commands

```bash
# Backend (runs tsc then node with watch)
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Regenerate Supabase types after schema changes
cd backend && npm run schema
```

## Frontend Design System

### Visual Style

- **Color scheme**: OKLCH-based CSS variables with full light/dark mode support
- **Theme**: Managed via `ThemeProvider` context with localStorage persistence (`vite-ui-theme` key)
- **Typography**: Inter Variable font family
- **Accents**: Indigo (`bg-indigo-600`) for primary CTAs, Rose/Emerald for feature highlights

### Animation Patterns

Use `tw-animate-css` classes for enter/exit animations:

```tsx
// Page elements - staggered fade-ins
<header className="animate-fade-in-down">
<main className="animate-fade-in-up">
<section className="animate-fade-in-up delay-200">

// Background decorative blurs
<div className="bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-fade-in" />
```

### Component Patterns

- **Cards**: Use `backdrop-blur-xl bg-card/60 border-border/50` for glassmorphism effect
- **Buttons**: Rounded (`rounded-full` for CTAs, `rounded-md` default), size `lg` with `h-14` for hero buttons
- **Hover states**: `group` + `group-hover:` for coordinated animations (e.g., icon scale on card hover)

### Layout Conventions

- **Public pages**: Standalone, no persistent navigation, decorative gradient backgrounds
- **Protected pages**: Floating sidebar layout with user profile at bottom (per `frontend_docs.md`)
- **Spacing**: Use `max-w-7xl mx-auto` for main content containers

### Form Handling

```tsx
// Schema definition with zod
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Form setup with react-hook-form
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
});

// Error display pattern
<Input className={errors.field ? "border-destructive" : ""} />;
{
  errors.field && (
    <p className="text-xs text-destructive">{errors.field.message}</p>
  );
}
```

### Notifications

Use `sonner` toast for user feedback:

```tsx
import { toast } from "sonner";
toast.success("Welcome back!");
toast.error(error.message || "Operation failed");
```

## Backend Patterns

### Error Handling

Always use `ApiError` class and wrap handlers with `asyncHandler`:

```typescript
import { ApiError } from "../types/apiError.types.js";
import { asyncHandler } from "../utils/asyncHandler.js";

throw new ApiError(400, "No file uploaded");
router.post("/", asyncHandler(authMiddleware), asyncHandler(handler));
```

### Route Structure

Each resource follows: `routes/` → `controllers/` with middleware chain:

```typescript
router.use(asyncHandler(authMiddleware)); // Apply auth to all routes
router.post("/", upload.single("document"), asyncHandler(uploadDocument));
```

### Database Queries

Use typed Supabase client from `utils/dbClient.ts`:

```typescript
import { supabase } from "../utils/dbClient.js";
const { data, error } = await supabase.from("documents").select().single();
```

### Frontend API Calls

Use centralized API client in `lib/api.ts` for backend calls:

```typescript
import { api } from "@/lib/api";
const departments = await api.getDepartments();
```

### Auth Pattern

- **Login**: Direct Supabase client (`supabase.auth.signInWithPassword`)
- **Registration**: Backend API (creates user + profile atomically)

## File Upload

- PDF only, 10MB max limit
- Multer with memory storage → S3 upload
- Files stored as `documents/{document_id}.pdf`

## Environment Variables

### Backend

```
PORT, DATABASE_URL, DATABASE_API_KEY
CLOUDFLARE_S3_ENDPOINT, CLOUDFLARE_ACCESS_KEY_ID, CLOUDFLARE_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME
```

### Frontend

```
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_BACKEND_URL
```

## TypeScript Notes

- Backend uses `"module": "nodenext"` - **always use `.js` extensions** in imports
- Database types auto-generated in `types/database.types.ts` - regenerate with `npm run schema`
- Frontend uses path alias `@/` mapped to `src/`
- Use `cn()` utility from `lib/utils.ts` for conditional class merging
