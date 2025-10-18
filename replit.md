# Echome Platform UI - Replit Setup

## Overview

This is a Next.js 15.4.6 application for testing new UI features, separate from the Vercel production deployment. It's an echome platform interface with dashboard, content kits, repurpose engine, and knowledge base features.

## Recent Changes

**October 18, 2025** - Content Kits Redesign, Gmail Auto-Expand & Audience Presets

- **Content Kits Redesign**: Rebranded Library page as "Content Kits" with modern UI improvements:
  - Enhanced card design with better visual hierarchy and semantic naming (e.g., "Your Fitness Journey Guide" instead of random IDs)
  - Added search functionality across kit titles and descriptions
  - Improved filtering system with status badges (Processing/Ready/Failed)
  - Grid/list view toggle for flexible content browsing
  - Updated sidebar navigation: "Library" → "Content Kits" with Package icon
- **Gmail Auto-Expand**: Implemented smart navigation from dashboard to Knowledge Base:
  - Clicking "Import Gmail" button on dashboard navigates to `/knowledge-base?action=gmail`
  - Gmail tutorial section automatically expands and smooth-scrolls into view
  - Improves onboarding UX by reducing clicks and eliminating manual scrolling
- Created 6 preset audience profiles covering full demographic spectrum (Urban Creative, Corporate Professional, Heartland American, Digital Native, Wellness Enthusiast, Established Expert)
- Implemented improved preset selection UX with auto-advance workflow:
  - Click preset → Shows preview card with "Continue to Formats" and "Customize Details" options
  - "Continue" → Auto-advances to next step (fast path)
  - "Customize" → Expands full form for detailed editing
- Quick Start presets now show by default on Audience step for faster onboarding
- Each preset includes: name, tone, style, target demographic, 5 pain points, 5 goals
- Removed redundant Step 4 (Review) - Formats step now directly triggers generation
- Streamlined to 3-step workflow: Source → Audience → Formats (with Generate button)
- After generation starts, user is redirected to Library page to view progress
- Added support for .mbox files (Google Takeout email archives) in file upload
- File upload now accepts: video, audio, PDF, and .mbox email archive files
- Fixed AWS Cognito authentication setup - cleaned up NEXT_PUBLIC_BASE_URL environment variable
- OTP login flow is now functional at `/signin` for live testing with backend

**October 17, 2025** - Echo Signal Branding & Navigation Updates

- Rebranded onboarding from temperature metaphor to Echo signal strength (silent/faint/clear/strong/crystal with WiFi-style signal bars)
- Unlocked Generate and Library pages in sidebar for development access (0 files required)
- Fixed all localStorage access errors and dashboard formatting issues
- Configured mock data system for testing without backend API
- File count milestones: 0 (silent), 10 (faint), 25 (clear), 50 (strong), 100 (crystal)

**October 17, 2025** - Initial Replit Setup

- Configured Next.js to run on Replit environment
- Updated dev/start scripts to use port 5000 and bind to 0.0.0.0
- Disabled Turbopack (incompatible with Replit's symlink structure)
- Removed husky git hooks (incompatible with Replit's git setup)
- Adjusted X-Frame-Options from DENY to SAMEORIGIN for Replit preview

## Project Architecture

- **Framework**: Next.js 15.4.6 (App Router)
- **Package Manager**: npm
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Charts**: Recharts

### Key Services

Located in `src/services/`:

- Analytics, Content Generation/Extraction
- Database content, Email, File upload
- Knowledge base, Media, Scheduling
- Social import, Transcription, PDF processing
- OAuth, Pinecone integration

## Environment Variables

See `.env.example` for all available variables:

- `NEXT_PUBLIC_BASE_URL` - API endpoint (optional, defaults to empty)
- Google services IDs (optional)

## Development

- **Dev Server**: Runs on port 5000 via workflow
- **Command**: `npm run dev`
- **Build**: `npm run build`
- **Production**: `npm start`

## Notes

- This is a **separate environment** from Vercel production
- Turbopack is disabled for Replit compatibility
- Git hooks (husky) are disabled in this environment
- X-Frame-Options set to SAMEORIGIN for Replit iframe preview
