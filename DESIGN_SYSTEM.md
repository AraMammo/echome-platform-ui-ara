# EchoMe Platform UI - Design System

Complete design system documentation including Tailwind configuration, CSS variables, authentication, API setup, and deployment structure.

---

## Table of Contents

1. [Tailwind Configuration](#tailwind-configuration)
2. [CSS Variables & Theme](#css-variables--theme)
3. [Authentication System](#authentication-system)
4. [API Configuration](#api-configuration)
5. [Domain & Deployment Structure](#domain--deployment-structure)
6. [Environment Variables](#environment-variables)

---

## Tailwind Configuration

### PostCSS Configuration

This project uses **Tailwind CSS v4** with PostCSS integration.

**File: `postcss.config.mjs`**

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

### Tailwind v4 Inline Configuration

Tailwind v4 does not use a separate `tailwind.config.ts` file. Instead, configuration is defined inline within `globals.css` using the `@theme` directive.

**Key Configuration Points:**

- **Border Radius:** `--radius: 0.625rem` (10px)
- **Sidebar Width (Expanded):** `16rem` (256px)
- **Sidebar Width (Icon Mode):** `4rem` (64px)
- **Design Philosophy:** Flat UI with minimal shadows and borders
- **Maximum Font Weight:** `font-medium` (500)

---

## CSS Variables & Theme

### Full `globals.css`

**File: `src/app/globals.css`**

```css
@import "tailwindcss";

:root {
  --radius: 0.625rem;
  --background: #f6f6f6;
  --foreground: #1c1c1e; /* Graphite Black */
  --card: #f6f6f6;
  --card-foreground: #1c1c1e; /* Graphite Black */
  --popover: #f6f6f6;
  --popover-foreground: #1c1c1e; /* Graphite Black */
  --primary: #3a8e9c; /* Deep Cyan */
  --primary-foreground: #ffffff;
  --secondary: oklch(0.95 0 0);
  --secondary-foreground: #1c1c1e; /* Graphite Black */
  --muted: oklch(0.95 0 0);
  --muted-foreground: #9b8baf; /* Slate Lavender */
  --accent: oklch(0.95 0 0);
  --accent-foreground: #1c1c1e; /* Graphite Black */
  --destructive: oklch(0.577 0.245 27.325);
  --border: #d5d2cc; /* Concrete Gray */
  --input: #f6f6f6;
  --ring: #3a8e9c; /* Deep Cyan */
  --chart-1: #3a8e9c; /* Deep Cyan */
  --chart-2: #9b8baf; /* Slate Lavender */
  --chart-3: #b4a398; /* Clay Taupe */
  --chart-4: #d5d2cc; /* Concrete Gray */
  --chart-5: #1c1c1e; /* Graphite Black */
  --sidebar: #f6f6f6;
  --sidebar-foreground: #1c1c1e; /* Graphite Black */
  --sidebar-primary: #3a8e9c; /* Deep Cyan */
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f0efec; /* Even lighter gray */
  --sidebar-accent-foreground: #1c1c1e; /* Graphite Black */
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  --sidebar-width: 16rem; /* expanded */
  --sidebar-width-icon: 4rem; /* icon mode */
}

.dark {
  --background: #1c1c1e; /* Graphite Black */
  --foreground: #f3f1ec; /* Soft Ivory */
  --card: #b4a398; /* Clay Taupe */
  --card-foreground: #f3f1ec; /* Soft Ivory */
  --popover: #b4a398; /* Clay Taupe */
  --popover-foreground: #f3f1ec; /* Soft Ivory */
  --primary: #3a8e9c; /* Deep Cyan */
  --primary-foreground: #f3f1ec; /* Soft Ivory */
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: #f3f1ec; /* Soft Ivory */
  --muted: oklch(0.269 0 0);
  --muted-foreground: #d5d2cc; /* Concrete Gray */
  --accent: oklch(0.269 0 0);
  --accent-foreground: #f3f1ec; /* Soft Ivory */
  --destructive: oklch(0.704 0.191 22.216);
  --border: #d5d2cc; /* Concrete Gray */
  --input: #b4a398; /* Clay Taupe */
  --ring: #3a8e9c; /* Deep Cyan */
  --chart-1: #3a8e9c; /* Deep Cyan */
  --chart-2: #9b8baf; /* Slate Lavender */
  --chart-3: #b4a398; /* Clay Taupe */
  --chart-4: #d5d2cc; /* Concrete Gray */
  --chart-5: #f3f1ec; /* Soft Ivory */
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-satoshi);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-satoshi), Arial, Helvetica, sans-serif;
}

/* Set all borders globally to use the border-border color variable */
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Knowledge Base Success Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 300ms ease-in-out;
}

.animate-scale-in {
  animation: scaleIn 400ms ease-in-out;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.6s ease-out;
}
```

### Color Palette

#### Light Mode Colors

| Variable             | Hex/Value | Description                 |
| -------------------- | --------- | --------------------------- |
| `--primary`          | `#3A8E9C` | Deep Cyan (brand primary)   |
| `--foreground`       | `#1C1C1E` | Graphite Black (text)       |
| `--background`       | `#F6F6F6` | Light gray background       |
| `--muted-foreground` | `#9B8BAF` | Slate Lavender (muted text) |
| `--border`           | `#D5D2CC` | Concrete Gray (borders)     |
| `--card`             | `#F6F6F6` | Card background             |
| `--sidebar-accent`   | `#F0EFEC` | Even lighter gray           |

#### Dark Mode Colors

| Variable       | Hex/Value | Description            |
| -------------- | --------- | ---------------------- |
| `--background` | `#1C1C1E` | Graphite Black         |
| `--foreground` | `#F3F1EC` | Soft Ivory (text)      |
| `--card`       | `#B4A398` | Clay Taupe             |
| `--primary`    | `#3A8E9C` | Deep Cyan (consistent) |
| `--border`     | `#D5D2CC` | Concrete Gray          |

#### Chart Colors

1. `--chart-1`: `#3A8E9C` (Deep Cyan)
2. `--chart-2`: `#9B8BAF` (Slate Lavender)
3. `--chart-3`: `#B4A398` (Clay Taupe)
4. `--chart-4`: `#D5D2CC` (Concrete Gray)
5. `--chart-5`: `#1C1C1E` (Graphite Black) / `#F3F1EC` (Soft Ivory - dark mode)

### Typography

- **Font Family:** Satoshi (custom local font)
- **Font Variable:** `--font-satoshi`
- **Fallback Stack:** `Arial, Helvetica, sans-serif`
- **Max Font Weight:** `font-medium` (500)

---

## Authentication System

### Token Management

**File: `src/utils/token-manager.ts`**

The `TokenManager` utility handles JWT token storage and validation in localStorage.

```typescript
export interface Tokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  userId: string;
}

export const TokenManager = {
  setTokens: (tokens: Tokens) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("idToken", tokens.idToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("userId", tokens.userId);
  },

  getTokens: (): PartialTokens => {
    return {
      accessToken: localStorage.getItem("accessToken") || undefined,
      idToken: localStorage.getItem("idToken") || undefined,
      refreshToken: localStorage.getItem("refreshToken") || undefined,
      userId: localStorage.getItem("userId") || undefined,
    };
  },

  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
  },

  areTokensExpired: (): boolean => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return true;

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },
};
```

### Auth Store (Zustand)

**File: `src/stores/auth-store.ts`**

Global authentication state managed with Zustand.

#### User Interface

```typescript
interface User {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  primaryWallet?: string;
  wallets?: string[];
  portfolioId?: string;
  media?: {
    images?: {
      avatar?: string;
    };
  };
  profilePicture?: string;
  profilePictureUrl?: string;
}
```

#### Auth State Methods

| Method                  | Description                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `initializeAuth()`      | Validates and restores session from localStorage on app load (with 5-minute buffer) |
| `login(user, session?)` | Sets user and authentication state                                                  |
| `logout()`              | Clears all tokens and resets state                                                  |
| `syncAuthState()`       | Syncs auth state with localStorage tokens                                           |
| `updateUser(userData)`  | Updates user data in store                                                          |
| `setLoading(loading)`   | Sets loading state                                                                  |

#### Token Expiration Logic

- **Buffer Time:** 300 seconds (5 minutes)
- **Formula:** `tokenExp < currentTime - 300`
- Tokens are considered expired 5 minutes before actual expiration

### Authentication Routes

#### Public Routes (No Layout)

**Route Group:** `(auth)`

| Route     | File Path                        | Description  |
| --------- | -------------------------------- | ------------ |
| `/signin` | `src/app/(auth)/signin/page.tsx` | Sign-in page |
| `/signup` | `src/app/(auth)/signup/page.tsx` | Sign-up page |

#### Protected Routes

**Route Group:** `(base)`

All routes under `src/app/(base)/*` are wrapped in the main layout with authentication checks.

**Base Layout:** `src/app/(base)/layout.tsx`

### AWS Cognito Integration

Authentication is powered by **AWS Cognito**.

**Required Environment Variables:**

```bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

---

## API Configuration

### API Client

**File: `src/utils/api-client.ts`**

Centralized HTTP client with automatic JWT token injection.

#### Configuration

```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const apiClient = new ApiClient({ baseUrl: baseUrl || "" });
```

#### Available HTTP Methods

```typescript
apiClient.get<T>(endpoint, options?)
apiClient.post<T>(endpoint, body?, options?)
apiClient.put<T>(endpoint, body?, options?)
apiClient.delete<T>(endpoint, options?)
apiClient.patch<T>(endpoint, body?, options?)
```

#### Request Options

```typescript
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  requiresAuth?: boolean; // default: true
}
```

#### Auto-Authentication

- Automatically adds `Authorization: Bearer {accessToken}` header
- Auto-handles **401 responses** by clearing tokens via `TokenManager.clearTokens()`
- Throws error: `"Authentication expired. Please sign in again."`

#### Error Handling

- Attempts to parse JSON error responses
- Extracts `message` or `error` fields from response body
- Falls back to HTTP status text if parsing fails

### Service Layer Pattern

All API interactions are abstracted into service files located in `src/services/`:

| Service File                      | Purpose                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| `contentGenerationService.ts`     | Content generation API calls                                  |
| `repurposeEngineService.ts`       | Content transformation/repurposing                            |
| `social-import.ts`                | Social media imports (YouTube, Instagram, Facebook via Apify) |
| `transcription.ts`                | Video/audio transcription                                     |
| `s3-upload.ts` / `file-upload.ts` | S3 file uploads                                               |
| `scheduling.ts`                   | Content scheduling                                            |
| `knowledge-base.ts`               | Knowledge base management                                     |
| `content-kit.ts`                  | Content kit operations                                        |
| `user.ts`                         | User profile operations                                       |
| `oauth.ts`                        | OAuth flows                                                   |
| `analytics.ts`                    | Analytics tracking                                            |

**Import Pattern:**

```typescript
import { apiClient } from "@/utils/api-client";
// or from service re-export:
import { apiClient } from "@/services/api-client";
```

---

## Domain & Deployment Structure

### Current Deployment

**Platform:** Vercel (inferred from Next.js + production patterns)

### Domain Configuration

#### Production Domains

| Domain          | Purpose                                 |
| --------------- | --------------------------------------- |
| `echome.ai`     | Primary production domain               |
| `tryechome.com` | Alternative domain (referenced in CORS) |

**Canonical URL:** `https://echome.ai`

#### API Gateway

**Base URL:** `https://ptjyo06xqg.execute-api.us-east-1.amazonaws.com`

**Region:** `us-east-1` (AWS US East - N. Virginia)

**Type:** AWS API Gateway v2 (HTTP API)

### CORS Configuration

**Allowed Origins (from `lib/api-stack.ts` in backend):**

- `https://echome.vercel.app`
- `https://tryechome.vercel.app`
- `https://echome.ai`
- `https://www.echome.ai`
- `https://tryechome.com`
- `https://www.tryechome.com`
- `http://localhost:5000` (local development)
- Replit development URLs (as needed)

**CORS Settings:**

```typescript
allowCredentials: true;
allowHeaders: ["*"];
allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
```

### S3 Bucket Configuration

**File Uploads Bucket:**

`378032286003-us-east-1-development-raw-file-uploads`

**Connect-src CSP Allowlist:**

```
connect-src 'self'
  https://ptjyo06xqg.execute-api.us-east-1.amazonaws.com
  https://api.echome.ai
  https://378032286003-us-east-1-development-raw-file-uploads.s3.us-east-1.amazonaws.com
```

### Security Headers

Configured in `next.config.ts`:

```typescript
{
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; ..."
}
```

### SEO Configuration

**Metadata (from `app/layout.tsx`):**

- **Title Template:** `%s | EchoMe`
- **Default Title:** `EchoMe - AI Content Creation Platform`
- **Theme Color:** `#3A8E9C` (primary cyan)
- **OpenGraph Images:** `/media/echome.png` (1200x630)
- **Twitter Card:** `summary_large_image`
- **Structured Data:** Organization, WebSite, SoftwareApplication schemas

---

## Environment Variables

### Required Variables

**File: `.env.local`**

```bash
# API Gateway
NEXT_PUBLIC_BASE_URL=https://ptjyo06xqg.execute-api.us-east-1.amazonaws.com

# AWS Cognito (required for auth)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# Optional
GOOGLE_VERIFICATION_ID=optional_google_verification
```

### Variable Prefix

All client-side accessible variables **must** be prefixed with `NEXT_PUBLIC_`:

```typescript
// ✅ Accessible in browser
process.env.NEXT_PUBLIC_BASE_URL;

// ❌ Only accessible server-side
process.env.DATABASE_URL;
```

---

## Development Scripts

```bash
npm run dev          # Start dev server on port 5000 (0.0.0.0)
npm run build        # Production build
npm run start        # Start production server on port 5000
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format with Prettier
npm run format:check # Check Prettier formatting
```

### Git Hooks (Husky)

**Pre-commit:** Automatically runs ESLint + Prettier on staged files via `lint-staged`

---

## Tech Stack Summary

| Technology      | Version | Purpose                           |
| --------------- | ------- | --------------------------------- |
| Next.js         | 15.4.6  | React framework with App Router   |
| React           | 19.1.0  | UI library with Server Components |
| Tailwind CSS    | v4      | Utility-first CSS framework       |
| TypeScript      | v5      | Type safety                       |
| Zustand         | 5.0.7   | State management                  |
| Radix UI        | Latest  | Accessible UI primitives          |
| Lucide React    | 0.539.0 | Icon library                      |
| AWS Cognito     | -       | Authentication service            |
| AWS API Gateway | v2      | API backend                       |

---

## Design Principles

1. **Flat UI Design:** No shadows, minimal borders and backgrounds
2. **Restricted Font Weights:** Maximum `font-medium` (500), no bold
3. **No Blue Colors:** Primary uses Deep Cyan (`#3A8E9C`)
4. **Accessibility First:** Built on Radix UI primitives
5. **Performance Optimized:** Image optimization, compression enabled, package import optimization
6. **SEO Ready:** Structured data, OpenGraph, Twitter cards, meta tags

---

**Last Updated:** 2025-10-19
