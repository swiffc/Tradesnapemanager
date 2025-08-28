# Overview

X-Vibz Trading Manager is a comprehensive trading analysis platform integrating X-Vibz methodology with BTMM (Beat The Market Makers) principles. Its purpose is to provide systematic trading analysis through 4 strategy levels (BIAS, SETUP, PATTERN, ENTRY'S), emphasizing detailed BIAS classification, market manipulation detection, and anti-institutional strategies for professional trading screenshot management and education. The platform aims to empower traders with advanced market maker analysis, moving beyond basic screenshot management to a survival-first approach in trading.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The application uses a modern React-based frontend with React + TypeScript, Vite for fast builds, Wouter for lightweight routing, TanStack Query for server state, Tailwind CSS for styling, Shadcn/UI for high-quality components, and React Hook Form for form management. It follows a component-driven architecture with resizable panel layouts.

## Backend Architecture

The backend implements a RESTful API using Express.js with TypeScript, featuring modular route organization, in-memory storage (designed for easy swap to persistent database), centralized error handling, and comprehensive request logging.

## Database Design

The application uses Drizzle ORM with PostgreSQL (specifically Neon Database for cloud deployment) for data persistence. It includes centralized schema definitions and aims for automatic migration support. The database schema includes tables for users, screenshots, and notes with proper relationships and indexing.

## File Storage and Management

A sophisticated object storage system is implemented using Google Cloud Storage. It features a custom authentication flow via Replit's sidecar service, a granular ACL system for access control based on user groups and permissions, and support for both public and private objects. Direct-to-cloud uploads are managed using presigned URLs.

## State Management

The application employs a layered state management approach: server state is handled by TanStack Query, client state by React's built-in hooks, form state by React Hook Form, and minimal global UI state via React Context.

## Authentication and Security

Security is implemented through object-level ACL for file storage, end-to-end TypeScript for type safety, schema-based input validation using Zod, proper CORS configuration, and environment-based configuration management.

## UI/UX Decisions

The platform features color-coded strategy categories (🔵 BIAS, 🟢 SETUP, 🟣 PATTERN, 🟠 ENTRY'S) and organized sections within dropdowns for clear visual hierarchy and intuitive navigation. This extends to both the screenshot upload form and the navigation sidebar for consistent user experience. The BIAS classification system uses specific patterns like MAAW and WVVM for systematic analysis, and integrates BTMM Market Maker Cycles with moving average frameworks (13/50/200/800) and ADR integration for comprehensive bias determination. SETUPS and PATTERNS are categorized into specific types for systematic analysis.

# External Dependencies

## Cloud Services

- **Google Cloud Storage**: Primary file storage.
- **Neon Database**: Serverless PostgreSQL database.
- **Replit Platform**: Development and deployment platform with integrated sidecar services.

## UI and Design

- **Radix UI**: Headless UI components.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Google Fonts**: Typography (Inter, DM Sans, Fira Code, Geist Mono).

## File Upload and Processing

- **Uppy**: Modular file upload library with direct cloud upload support.

## Development Tools

- **Vite**: Build tool and development server.
- **ESBuild**: Fast JavaScript bundler.
- **PostCSS**: CSS processing tool.
- **TypeScript**: Static type checking.

## Form Handling and Validation

- **React Hook Form**: Performant form library.
- **Hookform Resolvers**: Integration layer for schema validation.
- **Zod**: TypeScript-first schema validation.