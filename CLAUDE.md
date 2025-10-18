# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check Prettier formatting without changes
```

### Git Workflow

- Pre-commit hooks are configured via Husky
- `lint-staged` automatically runs ESLint and Prettier on staged files before commit
- All TypeScript/JavaScript files are linted and formatted automatically

## Architecture Overview

### Tech Stack

- **Framework:** Next.js 15 with App Router (Turbopack for development)
- **React:** React 19 with Server Components
- **Styling:** Tailwind CSS v4 with flat UI design
- **UI Components:** Radix UI primitives with custom styling
- **State Management:** Zustand
- **TypeScript:** Full type safety with strict mode enabled
- **Font:** Satoshi (custom local font) via `@/configs/fonts`

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes: /signin, /signup
│   ├── (base)/            # Main app routes (wrapped in Layout)
│   │   ├── create/        # Content creation
│   │   ├── transform/     # Content transformation/repurposing
│   │   ├── knowledge-base/ # File and content management
│   │   ├── content-kits/  # Content kit generation and management
│   │   ├── schedule/      # Content scheduling
│   │   ├── auto-clone/    # Auto-clone feature
│   │   ├── settings/      # User settings
│   │   └── help/          # Help resources
│   ├── globals.css        # Global styles and CSS variables
│   └── layout.tsx         # Root layout with metadata and providers
├── components/            # Atomic Design pattern
│   ├── atoms/             # Basic UI: Button, Input, Card, Tabs, etc.
│   ├── molecules/         # Composed components: FileUpload, Table, Calendar, etc.
│   └── organisms/         # Complex sections: Layout, Sidebar, AppSidebar
├── configs/               # Configuration (fonts, etc.)
├── hooks/                 # Custom React hooks
│   ├── api/              # API hooks (currently not in use)
│   └── ui/               # UI hooks (currently not in use)
├── services/              # API service layer
├── stores/                # Zustand stores (auth-store.ts)
├── types/                 # TypeScript type definitions (api.ts)
└── utils/                 # Utilities (api-client, token-manager, cn, seo)
```

### Authentication & Token Management

**Authentication Flow:**

- AWS Cognito integration for authentication
- JWT tokens stored in localStorage (accessToken, idToken, refreshToken, userId)
- `useAuthStore` (Zustand) manages auth state with methods:
  - `initializeAuth()` - Validates and restores session from localStorage on app load
  - `login(user, session?)` - Sets user and auth state
  - `logout()` - Clears tokens and resets state
  - `syncAuthState()` - Syncs with localStorage tokens
  - `updateUser(userData)` - Updates user data in store
- Token expiration checked with 5-minute buffer (300 seconds)

**API Client Pattern:**

- `src/utils/api-client.ts` - Centralized API client using `TokenManager`
- All API requests go through `apiClient` with automatic auth header injection
- HTTP methods: `get()`, `post()`, `put()`, `delete()`, `patch()`
- Auto-handles 401 responses by clearing tokens
- Base URL from `NEXT_PUBLIC_BASE_URL` environment variable

### Service Layer Architecture

All API interactions are abstracted into service files in `src/services/`:

- `contentGenerationService.ts` - Content generation
- `repurposeEngineService.ts` - Content repurposing/transformation
- `social-import.ts` - Social media import (YouTube, Instagram, Facebook via Apify)
- `transcription.ts` / `transcription-status.ts` - Transcription handling
- `s3-upload.ts` / `file-upload.ts` - File upload to S3
- `scheduling.ts` - Content scheduling
- `knowledge-base.ts` - Knowledge base management
- `content-kit.ts` - Content kit operations
- `user.ts` - User profile operations
- `oauth.ts` - OAuth flows
- `analytics.ts` - Analytics tracking

Services import from `src/services/api-client.ts` which re-exports the shared API client.

### Component Guidelines

**Atomic Design:**

- **Atoms:** Single-responsibility components (Button, Input, Label)
- **Molecules:** Combinations of atoms (FormField, FileUpload, Table)
- **Organisms:** Complex UI sections (Layout, Sidebar)

**Import Patterns:**

- Path alias: `@/*` maps to `./src/*`
- Component directories contain `index.tsx` (primary component file)
- Prefer direct imports: `import { Button } from "@/components/atoms/button"`

### Styling Guidelines

**Design System:**

- Custom color palette defined in `globals.css` CSS variables
- Primary color: `#3A8E9C` (Deep Cyan)
- Foreground: `#1C1C1E` (Graphite Black)
- No blue colors in design
- **Font weights max at `font-medium` (500)**
- **Flat UI design:** No shadows, minimal borders and backgrounds
- Border radius: `--radius: 0.625rem` (10px)

**Utility Function:**

- Use `cn()` from `@/utils/cn` for conditional className composition
- Based on `clsx` and `tailwind-merge`

### Route Groups & Layouts

- `(auth)` route group: Authentication pages without main app layout
- `(base)` route group: Main app routes wrapped in `<Layout>` component (src/app/(base)/layout.tsx)
- Root layout (`app/layout.tsx`) includes:
  - SEO metadata (OpenGraph, Twitter cards, structured data)
  - Custom Satoshi font
  - ToastProvider for notifications
  - Analytics component
  - PreloadResources for performance

### Key Features

**Social Media Import:**

- Import content from YouTube, Instagram, Facebook into knowledge base
- Apify backend integration (without exposing Apify branding)
- Real-time job tracking with polling
- See `SOCIAL_IMPORT_INTEGRATION.md` for details

**Content Generation:**

- Multiple content formats (video, article, social posts)
- Source file uploads (video, audio, PDF, text)
- Batch generation capabilities

**Content Transformation:**

- Repurpose existing content into different formats
- Integration with repurpose engine service

**Knowledge Base:**

- File management with drag-and-drop
- YouTube OAuth integration
- Social media content import
- Pinecone vector storage integration

### Configuration Files

**next.config.ts:**

- Image optimization (WebP, AVIF)
- Security headers (CSP, X-Frame-Options, etc.)
- Package import optimization for lucide-react and Radix UI
- Compression enabled
- SEO redirects configured

**tsconfig.json:**

- Strict mode enabled
- Path alias `@/*` for `./src/*`
- ES2017 target

**package.json:**

- Husky for Git hooks
- lint-staged for pre-commit linting/formatting
- ESLint + Prettier integration

### Environment Variables

Required environment variables (prefix with `NEXT_PUBLIC_` for client-side access):

```bash
NEXT_PUBLIC_BASE_URL=https://api-gateway-url
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_REGION=us-east-1
GOOGLE_VERIFICATION_ID=optional_google_verification
```

## Development Notes

### Adding New API Endpoints

1. Create or update service file in `src/services/`
2. Import `apiClient` from `@/utils/api-client`
3. Use typed request/response with TypeScript interfaces
4. Handle errors at service layer

### Adding New Routes

1. Create page under `src/app/(base)/` for authenticated routes
2. Use `src/app/(auth)/` for public auth pages
3. Update metadata in parent layout if needed
4. Follow existing patterns for consistency

### State Management

- Use Zustand for global state (see `auth-store.ts` as reference)
- Keep stores small and focused
- Export typed hooks for accessing store

### Form Handling

- Use `react-hook-form` for forms
- Radix UI components for form primitives
- Validate with Zod schemas (if needed)

### Testing Strategy

- Unit tests for utilities and services
- Integration tests for API flows
- E2E tests with Playwright (commands not yet configured in package.json)
