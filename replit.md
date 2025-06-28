# Pikonik Cafe Order Management System

## Overview

This is a full-stack restaurant order management system built for Pikonik Cafe. The application allows staff to create orders, manage menu items, generate Kitchen Order Tickets (KOT), and process bills. It features a modern React frontend with a Node.js/Express backend and PostgreSQL database integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom iOS-inspired design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas for request/response validation
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Migration Strategy**: Drizzle Kit for database migrations

## Key Components

### Data Models
- **Menu Items**: Store available food/drink items with pricing
- **Orders**: Track customer orders with table assignments and status
- **Order Items**: Individual items within each order with quantities and pricing

### API Endpoints
- `GET /api/menu-items` - Retrieve all menu items
- `POST /api/menu-items` - Create or update menu items
- `GET /api/orders` - Get all active orders
- `POST /api/orders` - Create new orders
- `PUT /api/orders/:orderNumber` - Update existing orders
- `POST /api/orders/:orderNumber/complete` - Mark orders as completed

### Frontend Features
- **Order Creation**: Dynamic form with menu item suggestions and autocomplete
- **Order Management**: Real-time list of active orders with status tracking
- **KOT Generation**: Kitchen order tickets for food preparation
- **Bill Generation**: Customer billing with itemized breakdown
- **Print Functionality**: Print KOTs and bills directly from the browser

## Data Flow

1. **Order Creation**: Staff enters order details through the React form
2. **Validation**: Zod schemas validate data on both client and server
3. **Database Storage**: Drizzle ORM persists data to PostgreSQL
4. **Real-time Updates**: React Query automatically refetches updated data
5. **Document Generation**: KOTs and bills are generated as printable HTML

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: Uses `@neondatabase/serverless` driver for database connectivity

### UI Components
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for potential future features

### Development Tools
- **Replit Integration**: Development environment optimized for Replit
- **TypeScript**: Full type safety across the entire stack
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Development
- Uses Vite dev server with HMR for fast development cycles
- Express server runs with tsx for TypeScript execution
- Database migrations managed through Drizzle Kit

### Production
- Vite builds optimized static assets to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Single process serves both API and static files
- Environment variables manage database connections

### Build Process
- `npm run build` - Creates production builds for both frontend and backend
- `npm run start` - Runs the production server
- `npm run db:push` - Applies database schema changes

## Changelog

```
Changelog:
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```