# Overview

This is a financial advisory application built with a React frontend and Express.js backend, designed to provide personalized financial guidance through an AI-powered chat interface. The system guides users through onboarding, advisor selection, decision trees, and interactive chat sessions with specialized financial advisors. It integrates with OpenAI's API for intelligent financial advice and uses PostgreSQL for data persistence.

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
1. **Onboarding**: Users complete financial profile including goals, income, and timeframe
2. **Advisor Selection**: Users choose from specialized financial advisors (Budget Planner, Savings Strategist, Debt Expert, Retirement Advisor)
3. **Decision Tree**: Users navigate through advisor-specific decision trees to gather context
4. **AI Chat**: OpenAI-powered conversations provide personalized financial advice based on user profile and decision history

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