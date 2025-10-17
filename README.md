# EchoMe Platform UI

Admin and platform dashboard for the EchoMe content generation platform. Built with Next.js 15, React 19, and modern UI components.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Access to EchoMe API endpoints
- Environment variables configured

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Create `.env.local` file:

   ```bash
   NEXT_PUBLIC_API_URL=https://your-api-gateway-url
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
   NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
   NEXT_PUBLIC_COGNITO_REGION=us-east-1
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

### Development Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run format:check # Check Prettier formatting
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **React**: React 19 with Server Components
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: Zustand
- **Icons**: Lucide React
- **TypeScript**: Full type safety

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (base)/            # Main application routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # UI Components (Atomic Design)
│   ├── atoms/             # Basic UI elements
│   ├── molecules/         # Composed components
│   ├── organisms/         # Complex UI sections
│   └── templates/         # Page-level templates
├── configs/               # Configuration files
├── hooks/                 # Custom React hooks
│   ├── api/              # API-related hooks
│   └── ui/               # UI-related hooks
├── services/              # API services and clients
├── stores/                # Zustand state stores
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

### Component Architecture

Following atomic design principles:

- **Atoms**: Basic UI elements (Button, Input, Label)
- **Molecules**: Simple component combinations (FormField, SearchBox)
- **Organisms**: Complex UI sections (Header, Sidebar, DataTable)
- **Templates**: Page layouts and structures

### State Management

Using Zustand for lightweight state management:

```typescript
// Example store
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

## 🔧 Development Guide

### Adding New Components

1. **Create component in appropriate atomic level:**

   ```typescript
   // src/components/atoms/new-button/index.tsx
   import { cn } from '@/utils/cn'

   interface NewButtonProps {
     variant?: 'primary' | 'secondary'
     children: React.ReactNode
   }

   export function NewButton({ variant = 'primary', children }: NewButtonProps) {
     return (
       <button className={cn('px-4 py-2', {
         'bg-blue-500 text-white': variant === 'primary',
         'bg-gray-200 text-gray-800': variant === 'secondary'
       })}>
         {children}
       </button>
     )
   }
   ```

2. **Export from component directory (avoid index.ts files per user preference)**

### API Integration

Using custom hooks for API calls:

```typescript
// src/hooks/api/use-content-generation.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { contentService } from "@/services/content-service";

export function useGenerateContent() {
  return useMutation({
    mutationFn: contentService.generateContent,
    onSuccess: (data) => {
      // Handle success
    },
    onError: (error) => {
      // Handle error
    },
  });
}

export function useContentHistory() {
  return useQuery({
    queryKey: ["content-history"],
    queryFn: contentService.getHistory,
  });
}
```

### Styling Guidelines

- Use Tailwind CSS v4 classes
- Follow flat UI design (no shadows, borders, backgrounds per user preference)
- Use internal color palette
- Font weights max at `font-medium`
- Avoid blue colors in design

### Authentication

Integrated with AWS Cognito:

```typescript
// src/stores/auth-store.ts
export const useAuthStore = create<AuthState>((set, get) => ({
  // Authentication state and methods
  login: async (credentials) => {
    const tokens = await cognitoAuth.signIn(credentials);
    set({ tokens, isAuthenticated: true });
  },
}));
```

## 🧪 Testing

### Running Tests

```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:e2e     # End-to-end tests with Playwright
```

### Testing Strategy

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration and user flows
- **E2E Tests**: Full user journey testing with Playwright

## 🚀 Deployment

### Vercel Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**

   ```bash
   vercel deploy
   ```

3. **Set environment variables in Vercel dashboard**

### Environment Variables

Required for production:

```bash
NEXT_PUBLIC_API_URL=https://api.echome.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

## 📚 Key Features

### Content Generation Dashboard

- Create personalized content in multiple formats
- Upload and manage source files
- View generation history and analytics

### File Management

- Drag-and-drop file uploads
- Support for video, audio, PDF, and text files
- File processing status tracking

### User Management

- AWS Cognito authentication
- User profile management
- Access control and permissions

### Analytics & Monitoring

- Content generation metrics
- User engagement tracking
- System health monitoring

## 🎨 Design System

### Colors

- Primary: Custom brand colors (no blue)
- Text: `text-[#0A142F]` for primary text
- Backgrounds: Minimal, flat design

### Typography

- Font Family: Suisse Intl (default)
- Weights: Up to `font-medium` maximum
- Responsive sizing with Tailwind

### Components

- Consistent spacing and sizing
- Accessible by default (Radix UI)
- Mobile-first responsive design

## 🤝 Contributing

1. Follow atomic design principles
2. Use TypeScript for all new code
3. Write tests for new features
4. Follow existing code patterns
5. Update documentation

## 📄 License

[License details]
