# Profile Manager Project

## Project Overview
A Next.js 15 profile management system with TypeScript and Tailwind CSS for managing team member profiles.

## Features
- Public profile listing page with filters (role, availability, skills, search)
- Profile cards with video/image support
- Admin panel for HR to add/delete profiles
- Responsive design with Tailwind CSS

## Tech Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Package Manager: npm

## Project Structure
```
src/
├── app/
│   ├── page.tsx          # Public profiles page
│   ├── admin/page.tsx    # Admin panel
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── ProfileCard.tsx   # Profile display
│   └── FilterPanel.tsx   # Filter controls
├── types/
│   └── profile.ts        # TypeScript interfaces
└── data/
    └── profiles.ts       # Mock data
```

## Running the Project
- Development: `npm run dev` (Running on http://localhost:3001)
- Build: `npm run build`
- Production: `npm start`

## Key Pages
- `/` - Public profile listing with filters
- `/admin` - Admin panel for managing profiles

## Setup Completed
- [x] Project structure created
- [x] Dependencies installed
- [x] TypeScript configured
- [x] Tailwind CSS configured
- [x] Public profile page built
- [x] Admin interface built
- [x] Development server running
