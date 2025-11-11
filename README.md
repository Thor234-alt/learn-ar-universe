# learnAR Project Documentation

## Overview

learnAR is an interactive educational platform leveraging AR (Augmented Reality) to enhance learning experiences for students, teachers, and administrators. The project is built with a modern web stack and is organized for scalability and maintainability.

## Tech Stack

- **Frontend Framework:** React (with Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn-ui
- **State Management:** React Context API
- **Backend/Database:** Supabase (integration)
- **Other:** PostCSS, ESLint

## Project Structure

```
learn-ar-universe/
  ├── public/                # Static assets
  ├── src/                   # Source code
  │   ├── components/        # All UI and feature components
  │   ├── contexts/          # React context providers
  │   ├── hooks/             # Custom React hooks
  │   ├── integrations/      # Supabase client and types
  │   ├── lib/               # Utility libraries
  │   ├── pages/             # Top-level pages/routes
  │   ├── services/          # Business logic and API services
  │   ├── types/             # TypeScript types
  │   ├── utils/             # Utility/helper functions
  │   └── index.css, App.tsx # Entry points
  ├── supabase/              # Supabase config and migrations
  ├── package.json           # Project metadata and scripts
  └── ...
```

## Components

### Admin Components
- **ContentCard.tsx**: Displays a card for a piece of module content (text, video, image, PDF, URL, or 3D model) with options to edit, delete, and generate QR codes for 3D models. Used in content management.
- **ContentList.tsx, ContentManagement.tsx, CreateContentDialog.tsx, CreateModuleDialog.tsx, CreateTeacherDialog.tsx, EditSubInfoDialog.tsx, ModelManagement.tsx, ModelUpload.tsx, ModuleManagement.tsx, TeacherManagement.tsx**: Provide admin interfaces for managing content, modules, teachers, and 3D models. These components handle CRUD operations, dialogs, and data display for admin users.

### Student Components
- **ModuleCard.tsx**: Shows a module with its topics, progress, and allows students to view module content. Integrates with Supabase for progress tracking.
- **TopicCard.tsx, ModuleContentViewer.tsx, WelcomeHeader.tsx, LoadingSpinner.tsx, EmptyModulesState.tsx**: Support the student dashboard, topic navigation, and loading states.
- **moduleContentViewer/**: Contains subcomponents for displaying and navigating module content (ContentDisplay, ContentListSidebar, ContentViewerHeader, moduleContentViewerUtils).

### Teacher Components
- **TeacherDashboardLayout.tsx**: Main layout for the teacher dashboard, aggregating stats, student progress, module stats, and recent activity. Integrates with hooks for teacher data.
- **StudentProgressCard.tsx, StatsOverview.tsx, ModuleStatsCard.tsx, RecentActivityCard.tsx, ActiveModulesSection.tsx, ContentViewerModal.tsx**: Visualize student progress, module stats, and allow teachers to preview content.

### AR Components
- **ARViewer.tsx**: Main AR/3D model viewer. Supports both 3D canvas and AR camera modes, with controls for zoom, reset, info, and sharing. Integrates with Three.js and @react-three/fiber.
- **ARCamera.tsx**: Handles AR camera functionality for model overlay.
- **ARExperience.tsx**: Orchestrates the AR experience.
- **QRCodeGenerator.tsx**: Generates QR codes for sharing AR content.

### Common Components
- **ThreeDModelViewer.tsx**: Reusable 3D model viewer with error handling, loading states, and support for multiple model formats.

### UI Components (shadcn-ui based)
- **ui/**: Contains all reusable UI primitives (Button, Card, Dialog, Input, Tabs, Tooltip, etc.) styled with Tailwind and shadcn-ui. These are used throughout the app for consistent design and accessibility.

### Layouts
- **layouts/PublicLayout.tsx**: Provides a public-facing layout wrapper for non-authenticated pages.

### Other Feature Sections
- **Navbar.tsx, HeroSection.tsx, FeaturesSection.tsx, DemoSection.tsx, CTASection.tsx, StatsSection.tsx, TestimonialsSection.tsx**: Presentational components for the landing page and marketing sections.

## Hooks

### useTeacherData
Fetches and aggregates teacher dashboard data, including student progress, student profiles, and modules. Provides loading state and a refetch method. Used in teacher dashboard components.

### useStudentDashboard
Fetches modules, topics, and student progress for the logged-in student. Supports real-time updates and provides helpers for topic progress and starting topics. Used in student dashboard and module navigation.

### useProfile
Manages fetching and storing the current user's profile from Supabase. Provides methods to fetch, clear, and set the profile. Used in authentication and profile-related flows.

### useModelData
Fetches 3D model data by content ID, with loading and error states. Used in AR/3D model viewers to dynamically load model information.

### useAuth
Provides authentication context, including user, session, profile, and auth actions (sign in, sign out, sign up, Google sign-in). Used throughout the app for access control and user state.

### useAdminDashboard
Fetches modules and teachers for the admin dashboard, merging teacher data with profile information. Provides loading state and a fetch method. Used in admin dashboard components.

### useIsMobile (use-mobile)
Detects if the current device is mobile based on window width. Used for responsive UI adjustments.

## Pages

### Index.tsx
Landing page for the platform. Composes the main marketing and informational sections (Hero, Features, Demo, Stats, Testimonials, CTA) and the Navbar. No authentication required.

### AdminDashboard.tsx
Main dashboard for admin users. Provides tabbed navigation for managing modules, content, and teachers. Integrates with admin management components and hooks for data fetching. Requires admin authentication.

### TeacherDashboard.tsx
Main dashboard for teachers. Renders the TeacherDashboardLayout, which aggregates stats, student progress, and module management. Requires teacher authentication.

### StudentDashboard.tsx
Main dashboard for students. Shows available modules, progress, and allows navigation to module content. Integrates with student dashboard hooks and components. Requires student authentication.

### StudentAuth.tsx
Authentication page for students. Supports sign in, sign up, and Google authentication. Allows switching to the admin portal.

### AdminAuth.tsx
Authentication page for admins, teachers, and clients. Supports sign in, sign up, Google authentication, and role selection. Allows switching to the student portal.

### NotFound.tsx
404 error page for undefined routes. Displays a user-friendly message and a link to return home.

## Services

### authService.ts
Handles authentication logic using Supabase. Provides methods for:
- `signUp(email, password, fullName, role)`: Registers a new user with a specified role (student, teacher, admin, client). Stores additional user data in Supabase.
- `signIn(email, password)`: Authenticates a user with email and password.
- `signInWithGoogle(role)`: Authenticates a user via Google OAuth, passing the intended role as a query param.
- `signOut()`: Signs out the current user and redirects to the home page.

### modelService.ts (ModelService class)
Handles all business logic for 3D model content:
- `getModelByQRCode(qrCodeId)`: Fetches a 3D model by QR code/content ID, ensuring it is active and of type '3d_model'.
- `getPublicModel(contentId)`: Fetches a public 3D model by content ID, increments access count, and validates access.
- `getModelUrl(modelData)`: Returns the public URL for a 3D model file, constructing it if necessary.
- `incrementAccessCount(contentId)`: Increments the access count for a model in the database.
- `getPublicModels()`: Returns all public 3D models for browsing.
- `transformToModelData(data)`: Converts a database row to the ModelData interface.
- `validateModelData(data)`: Validates the structure of model data.

## Context, Types, and Utils

### Contexts
- **AuthContext.tsx**: Provides the authentication context for the app, including user, profile, session, and auth actions. Used by the `useAuth` and `useAuthContext` hooks to access and manage authentication state throughout the app.

### Types
- **auth.ts**: Defines TypeScript types for authentication, including `Profile`, `UserRole`, and the `AuthContextType` interface used by the AuthContext.

### Utils
- **authRedirect.ts**: Utility for redirecting users to the correct dashboard based on their role after authentication (student, admin, teacher, client).
- **qrCodeUtils.ts**: Utility class for generating QR codes for AR models, extracting model IDs from URLs, generating shareable AR URLs, and validating UUIDs.
- **qrGenerator.ts**: Functions for generating and downloading QR codes for AR models, and constructing AR URLs.
- **teacherDashboardUtils.ts**: Utilities for aggregating student and module statistics for the teacher dashboard, including functions to get unique students and module stats.

## Development Guide

### Setup
1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd learn-ar-universe
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the development server:**
   ```sh
   npm run dev
   ```

### Environment Variables
- Configure Supabase and any other required environment variables as needed (see `.env.example` if available).

### Deployment
- You can deploy via  your preferred platform (Vercel, Netlify, etc.).
- To build for production:
   ```sh
   npm run build
   ```
- To preview the production build locally:
   ```sh
   npm run preview
   ```

---

*This documentation is a living document. Please update as the project evolves.*
