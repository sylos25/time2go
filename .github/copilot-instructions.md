# Copilot Instructions for Time2Go

## Overview
This project is a **Next.js** application focused on event management. It includes a dashboard for data insertion, user authentication, and various administrative functionalities.

## Architecture
- **Main Components:**
  - **Dashboard:** Central hub for managing events and data.
  - **API Routes:** Located in `src/app/api/`, handling data operations.
  - **Components:** UI components are organized in `src/components/`.

## Developer Workflows
- **Running the Development Server:** Use `npm run dev` to start the application locally.
- **Building for Production:** Use `npm run build` to create an optimized build.
- **Testing:** Ensure to run tests after making changes to critical components.

## Project Conventions
- **File Structure:**
  - Components are organized by functionality in `src/components/`.
  - API routes are structured under `src/app/api/`.
- **Naming Conventions:** Use camelCase for variables and PascalCase for components.

## Integration Points
- **Database:** The application interacts with a database through API routes defined in `src/app/api/admin/insert-data/route.ts`.
- **External Services:** Integration with email services for user validation and notifications.

## Communication Patterns
- **State Management:** Use React Context or hooks for managing global state across components.
- **Data Flow:** Data is fetched from APIs and passed down to components as props.

## Key Files/Directories
- **Main Dashboard Component:** `src/components/dashboard/insert-data-tab.tsx`
- **API Route for Data Insertion:** `src/app/api/admin/insert-data/route.ts`
- **Documentation:** Refer to the `/docs` directory for detailed guides on setup and usage.