# Tarim Tours Frontend - Supabase Migration (v4)

This repository contains the frontend for Tarim Tours, migrated from Strapi to Supabase with a hybrid approach, preparing for future microservices.

## Project Overview

This project aims to provide a modern, scalable, and future-ready frontend for Tarim Tours, leveraging Supabase for content management, authentication, and real-time features, while laying the groundwork for custom microservices.

## Key Features

- **Modern, Scalable Architecture**: Transitioned from Strapi to Supabase for a robust backend-as-a-service.
- **Future-Ready for Microservices**: Designed with a service layer that can integrate with both Supabase and future custom microservices.
- **Optimized for VPS and Coolify**: Includes Docker and Coolify deployment configurations.
- **Real-time Capabilities**: Utilizes Supabase subscriptions for real-time updates (e.g., booking status).
- **Proper Security**: Implemented Row Level Security (RLS) policies and Supabase Auth for secure data access.
- **Performance Optimization**: Includes database indexing and caching strategies.

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (e.g., Shadcn UI)
│   ├── forms/        # Form-related components
│   ├── layout/       # Application layout components
│   └── features/     # Components specific to certain features (e.g., booking, visa)
├── lib/
│   ├── supabase.ts   # Supabase client initialization
│   ├── api.ts        # Centralized API functions (now routing to SupabaseAPI)
│   ├── types.ts      # Global TypeScript type definitions
│   └── utils.ts      # General utility functions
├── hooks/
│   ├── useAuth.ts    # Custom hook for authentication logic
│   ├── useSupabase.ts # Custom hooks for Supabase interactions (if any specific)
│   └── useApi.ts     # Custom hook for API calls
├── store/
│   └── authStore.ts  # State management for authentication (e.g., Zustand, Jotai)
├── pages/            # Main page components (e.g., Home, Shop, Profile)
└── constants/        # Application-wide constants and configurations
```

## Migration Summary

The migration involved several key phases:

1.  **Repository Analysis**: Reviewed existing Strapi-dependent code to understand data flow and API interactions.
2.  **Supabase Database Schema Setup**: Created new tables in Supabase mirroring Strapi content types (`travel_packages`, `esim_products`, `travel_accessories`, `visa_applications`, `international_driving_license_applications`, `trip_com_bookings`, `trip_com_search_logs`).
3.  **Authentication & Security Configuration**: Replaced Strapi authentication with Supabase Auth and implemented comprehensive Row Level Security (RLS) policies across all tables, including adding `user_id` columns for user-specific data.
4.  **Frontend Code Update**: Modified the frontend to use the Supabase client for all data operations, including authentication, data fetching, and form submissions. The `api.ts` file was updated to route calls to the new `supabaseAPI.ts`.
5.  **File Storage & Trip.com Integration**: Configured Supabase Storage for file uploads (buckets: `applications`, `uploads`) and developed a `TripComIntegrationService` to handle hotel searches and bookings, including real-time updates via Supabase subscriptions.
6.  **Deployment Configuration & Testing**: Updated Dockerfile, created `docker-compose.yml` for local development, and provided `coolify-deploy.yml` for easy deployment to Coolify. The project successfully builds for production.

## Getting Started

### Prerequisites

-   Node.js (v20 or higher)
-   npm or pnpm
-   Supabase project with configured database and storage buckets

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/aelshekeil/tarimtours-frontend-v4.git
    cd tarimtours-frontend-v4
    ```

2.  **Install dependencies:**
    ```bash
    npm install # or pnpm install
    ```

3.  **Configure environment variables:**
    Copy the `.env.example` file to `.env` and update it with your Supabase project URL and Anon Key:
    ```bash
    cp .env.example .env
    ```
    Edit `.env`:
    ```env
    VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    VITE_TRIPCOM_API_KEY=your_tripcom_api_key_here # Optional
    VITE_TRIPCOM_API_URL=https://api.trip.com/v1 # Optional
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Production Deployment

Refer to the `DEPLOYMENT_GUIDE.md` file for detailed instructions on deploying to Docker, Coolify, or a manual VPS setup.

## Future Considerations (Phase 2)

This setup is designed to be hybrid, allowing for a gradual transition to custom microservices. In the future, you can:

-   **Keep Supabase for Content Management**: Continue using Supabase for static content, user authentication, and file storage.
-   **Develop Custom Microservices**: Build dedicated services for complex logic like booking, payment, and advanced integrations, connecting them to the frontend as needed.

This approach provides flexibility and scalability for the long term.

