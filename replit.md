# Overview

FinApp - The world's most advanced AI Financial Education Platform. This revolutionary application combines comprehensive financial education with cutting-edge AI technology to create the biggest learning AI financial experiment ever. Built with React frontend and Express.js backend, it features advanced data collection, behavioral analytics, AI model tuning, and 3D financial visualizations. The system provides personalized financial guidance through AI-powered advisors while continuously learning from user interactions to improve financial literacy globally.

## Recent Changes (August 6, 2025)
- **Revolutionary Platform Enhancement Complete**: Mandatory separate sign-in system with advanced AI and crypto marketplace
- **Mandatory Authentication System**: Separate mandatory profile completion page at /signin with admin login functionality - completely removed from FinApp main interface
- **Advanced AI Agents**: Spectrum tax data integration with quantum mathematics for predictive customer needs analysis using 2025 tax reforms
- **Crypto Marketplace Revolution**: Peer-to-peer advice trading system where users earn cryptocurrency from premium subscriptions and community contributions
- **Gamified Community Rewards**: Complex Q&A platform where detailed financial explanations earn transferable cryptocurrency (BTC, ETH)
- **Admin Authentication System**: Special admin access with enhanced privileges and platform control capabilities
- **Quantum Mathematical Models**: AI agents using quantum Monte Carlo simulations for portfolio optimization and market predictions
- **Spectrum Tax Analysis**: Up-to-date 2025 tax reform integration with advanced loophole identification and optimization strategies
- **Comprehensive API Integration**: All advanced AI, crypto marketplace, and authentication routes fully functional

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
1. **Mandatory Authentication Gateway**: Separate sign-in page with comprehensive profile completion requirement before platform access
2. **Advanced AI Prediction Engine**: Spectrum tax analysis and quantum mathematics integration for predictive customer needs assessment
3. **Crypto Marketplace Ecosystem**: Peer-to-peer financial advice trading using cryptocurrency earned from premium subscriptions
4. **Community Rewards System**: Gamified Q&A platform where complex financial explanations earn transferable cryptocurrency
5. **Admin Control Panel**: Enhanced administrative access with platform management and user oversight capabilities
6. **Quantum Financial Analytics**: Mathematical models for portfolio optimization and market volatility prediction
7. **Real-Time Tax Optimization**: 2025 reform integration with automated loophole identification and strategy recommendations

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
  - 3D Animations (framer-motion)
  - Crypto Integration Components

- **Backend Libraries**:
  - Express.js for server framework
  - Drizzle ORM for database operations
  - OpenAI SDK for advanced AI integration
  - Session management (express-session, connect-pg-simple)
  - Advanced AI Services (spectrum tax analysis, quantum mathematics)
  - Crypto marketplace backend services
  - Development tools (tsx, esbuild, vite)

## Development Tools
- **Build System**: Vite for frontend bundling and development server
- **Type Checking**: TypeScript across the entire stack
- **Database**: Drizzle Kit for schema management and migrations
- **Development Environment**: Replit-specific plugins for enhanced development experience