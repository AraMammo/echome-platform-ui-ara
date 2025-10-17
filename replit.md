# Echome Platform UI - Replit Setup

## Overview
This is a Next.js 15.4.6 application for testing new UI features, separate from the Vercel production deployment. It's an echome platform interface with dashboard, content kits, repurpose engine, and knowledge base features.

## Recent Changes
**October 17, 2025** - Initial Replit setup
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
