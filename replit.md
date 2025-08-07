# Overview

FinApp is a revolutionary AI Financial Education Platform designed to combine comprehensive financial education with cutting-edge AI technology. Its purpose is to create the biggest learning AI financial experiment, providing personalized financial guidance through AI-powered advisors. The platform continuously learns from user interactions to improve global financial literacy. Key capabilities include advanced data collection, behavioral analytics, AI model tuning, and 3D financial visualizations, all aimed at delivering an advanced, personalized financial learning experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool.
- **UI Components**: Radix UI primitives and shadcn/ui component library.
- **Styling**: TailwindCSS with custom CSS variables for theming.
- **State Management**: React Query (TanStack Query) for server state.
- **Routing**: Wouter for client-side routing.
- **Form Handling**: React Hook Form with Zod validation.

## Backend Architecture
- **Runtime**: Node.js with Express.js framework.
- **Database ORM**: Drizzle ORM with PostgreSQL support.
- **Database Provider**: Neon Database (PostgreSQL-compatible serverless database).
- **Development Setup**: Development server with hot reload using Vite middleware.
- **Production Readiness**: Enhanced initialization with comprehensive error handling, validation, and health monitoring.
- **Connection Pooling**: Optimized database connection management.
- **Health Monitoring**: Multi-endpoint health checking.

## Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database.
- **Schema Management**: Drizzle Kit for migrations and schema management.
- **Key Tables**: `users`, `user_profiles`, `advisors`, `advisor_sessions`, `chat_messages`, `decision_tree_progress`, `achievements`, `user_achievements`. Dedicated tables for comprehensive analytics including user sessions, page analytics, interaction events, financial data, tool usage, AI interaction, community engagement, gamification, error tracking, reporting, and predictive analytics. Additional tables support the Jarvis AI Admin System for sessions, conversations, knowledge base, tasks, and training data.

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple).
- **User Identification**: UUID-based user identification system.
- **Data Access**: Role-based access through the storage layer interface.
- **Security**: bcryptjs with 12-round salt encryption for password hashing, comprehensive password strength validation, and secure token generation.

## Core Application Flow & Features
1.  **Secure Landing Experience**: Professional landing page with mandatory authentication and profile completion.
2.  **Complete Financial Services Suite**: Six comprehensive AI-powered financial tools:
    -   AI Report Generator
    -   Investment Consultation AI
    -   Tax Optimization & Legal Strategies
    -   Safe Retirement Planning
    -   Learning Access Hub
    -   Community & Discussions
3.  **Multi-Generational Gaming Hub**: Age-appropriate financial education through interactive games and reward systems.
4.  **Enhanced Crypto Marketplace**: Advanced trading platform with real-time data, competitive bidding, and comprehensive analytics.
5.  **AI-Powered Analysis Dashboard**: Real-time market analysis, tax optimization, and quantum mathematical predictions.
6.  **Comprehensive Admin Control (Jarvis AI System)**: Admin-only AI assistant with full development permissions, OpenAI GPT-4o integration, real-time analytics tracking, accessible from admin panel at /admin-jarvis, intelligent conversation capabilities, and comprehensive system awareness.
7.  **Real-Time Data Integration**: Live market feeds, economic indicators, tax regulations, and sentiment analysis.
8.  **Speech Recognition Integration**: Client-side Web Speech API with server-side processing for transcript validation.

# Recent Changes (August 7, 2025)
✅ **Enhanced Jarvis AI Intelligence**: Connected Jarvis AI to real OpenAI GPT-4o API for intelligent responses
✅ **AI Analytics Integration**: Connected Jarvis interactions to AI performance analytics system
✅ **Admin Panel Access**: Added Jarvis AI access card to admin dashboard for easy navigation
✅ **Diagnostics Integration**: Connected diagnostics system to admin panel with proper routing

# External Dependencies

## Third-Party Services
-   **OpenAI API**: GPT-4 model integration for intelligent financial advice.
-   **Neon Database**: Serverless PostgreSQL database hosting.

## Key NPM Packages
-   **Frontend Libraries**: React ecosystem, @radix-ui/* components, shadcn/ui, react-hook-form, @hookform/resolvers, zod, drizzle-zod, tailwindcss, class-variance-authority, clsx, framer-motion, Crypto Integration Components.
-   **Backend Libraries**: Express.js, Drizzle ORM, OpenAI SDK, express-session, connect-pg-simple, Advanced AI Services (spectrum tax analysis, quantum mathematics), Crypto marketplace backend services.

## Development Tools
-   **Build System**: Vite.
-   **Type Checking**: TypeScript.
-   **Database**: Drizzle Kit for schema management and migrations.