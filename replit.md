# Overview

FinApp - The world's most advanced AI Financial Education Platform. This revolutionary application combines comprehensive financial education with cutting-edge AI technology to create the biggest learning AI financial experiment ever. Built with React frontend and Express.js backend, it features advanced data collection, behavioral analytics, AI model tuning, and 3D financial visualizations. The system provides personalized financial guidance through AI-powered advisors while continuously learning from user interactions to improve financial literacy globally.

## Recent Changes (August 6, 2025)
- **Comprehensive Enhancement Complete**: Mandatory profile sign-up system with multiple authentication options implemented
- **3D Enhanced Landing Page**: Added FloatingElements component with animated 3D financial icons and enhanced visual experience  
- **AI Use Cases Showcase**: Comprehensive section detailing AI report generator, investment consultations, tax optimization with up-to-date reforms, safe retirement planning, learning access, and community features
- **Gamified Experience**: Full implementation of levels, rewards, and community Q&A system where users earn cryptocurrency-transferable points for detailed financial explanations
- **Mandatory Profile System**: Multi-step sign-up modal with social login options, comprehensive financial profiling, and goal-setting capabilities
- **Enhanced Database & API**: All 18 tables working with proper relationships, subscription plans API fixed, comprehensive user authentication system
- **3D Components**: Created reusable 3D card, button, and animated number components for enhanced user experience

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: TailwindCSS with custom CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL support
- **Database Provider**: Neon Database (PostgreSQL-compatible serverless database)
- **Development Setup**: Development server with hot reload using Vite middleware

## Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Tables**:
  - `users` - Basic user information
  - `user_profiles` - Financial profile data including goals, income, savings
  - `advisors` - Financial advisor configurations
  - `advisor_sessions` - Session management between users and advisors
  - `chat_messages` - Chat conversation history
  - `decision_tree_progress` - User progress through financial decision trees
  - `achievements` and `user_achievements` - Gamification elements

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User Identification**: UUID-based user identification system
- **Data Access**: Role-based access through the storage layer interface

## Core Application Flow
1. **Smart Onboarding**: Advanced profiling with behavioral pattern recognition and learning style detection
2. **AI Advisor Ecosystem**: Dynamic advisor selection with specialized financial education modules
3. **Interactive Decision Trees**: Gamified financial decision-making with real-time feedback and learning analytics
4. **Intelligent Chat System**: Context-aware AI conversations with sentiment analysis and personalized learning paths
5. **Data Collection & Analytics**: Comprehensive user behavior tracking for AI model improvement and financial education research
6. **3D Visualizations**: Immersive financial data representations and interactive learning modules

## Speech Recognition Integration
- **Client-Side**: Web Speech API integration for voice input
- **Server-Side**: Speech processing utilities for transcript validation and formatting

# External Dependencies

## Third-Party Services
- **OpenAI API**: GPT-4 model integration for intelligent financial advice generation
- **Neon Database**: Serverless PostgreSQL database hosting

## Key NPM Packages
- **Frontend Libraries**:
  - React ecosystem (React, React DOM, React Query)
  - UI Components (@radix-ui/* components, shadcn/ui)
  - Form handling (react-hook-form, @hookform/resolvers)
  - Validation (zod, drizzle-zod)
  - Styling (tailwindcss, class-variance-authority, clsx)
  - Speech recognition (Web Speech API)

- **Backend Libraries**:
  - Express.js for server framework
  - Drizzle ORM for database operations
  - OpenAI SDK for AI integration
  - Session management (express-session, connect-pg-simple)
  - Development tools (tsx, esbuild, vite)

## Development Tools
- **Build System**: Vite for frontend bundling and development server
- **Type Checking**: TypeScript across the entire stack
- **Database**: Drizzle Kit for schema management and migrations
- **Development Environment**: Replit-specific plugins for enhanced development experience