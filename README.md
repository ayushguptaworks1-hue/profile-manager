# Profile Manager

A modern Next.js application for managing team member profiles with advanced filtering and an admin interface.

## Features

### Public Profile Page
- **Profile Cards**: Display team members with intro videos or images
- **Key Information**: Shows role, experience, skills, and availability status
- **Advanced Filters**: Search by name, filter by role, availability, and skills
- **Responsive Design**: Beautiful UI that works on all devices
- **Contact Integration**: Direct email contact for team members

### Admin Panel
- **Add Profiles**: Simple form to add new team members
- **Profile Management**: View and delete existing profiles
- **Media Support**: Upload both images and video introductions
- **Skills Management**: Add multiple skills with easy tag interface
- **Availability Tracking**: Mark team members as Available, Busy, or On Leave

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Public profiles page
│   ├── admin/
│   │   └── page.tsx      # Admin panel
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── ProfileCard.tsx   # Profile display component
│   └── FilterPanel.tsx   # Filter controls component
├── types/
│   └── profile.ts        # TypeScript interfaces
└── data/
    └── profiles.ts       # Profile data and utilities
```

## Usage

### Viewing Profiles

Navigate to the home page to:
- Browse all team member profiles
- Filter by role, availability, or skills
- Search for specific team members
- View intro videos or profile pictures
- Contact team members directly

### Managing Profiles (Admin)

Access the admin panel at `/admin` to:
- Add new team member profiles
- Specify video or image media
- Add skills and experience details
- Set availability status
- Delete existing profiles

## Features in Detail

### Profile Data Structure

Each profile includes:
- Name and role
- Years of experience
- Skills array
- Availability status (Available/Busy/On Leave)
- Media (video or image)
- Bio, email, and location (optional)

### Filtering System

The filter panel supports:
- **Text Search**: Find profiles by name
- **Role Filter**: Filter by job role
- **Availability Filter**: Show only available/busy/on leave
- **Skills Filter**: Multi-select skill filtering
- **Clear All**: Reset all filters at once

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Future Enhancements

Potential improvements:
- Database integration (PostgreSQL, MongoDB)
- Authentication for admin panel
- Profile editing functionality
- Export profiles to CSV
- Advanced analytics dashboard
- Email notifications
- Role-based access control

## Notes

- Current implementation uses in-memory data storage
- Profile data persists only during the session
- For production use, integrate with a database
- Media URLs should point to actual hosted files

## License

This project is created as a demonstration and is available for use and modification.
