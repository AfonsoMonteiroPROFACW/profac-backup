# PROFAC - Sistema de Gestão para Factoring

## Overview
PROFAC is a comprehensive factoring management system for the Brazilian financial sector. It's a full-stack web application designed to securely and efficiently manage factoring operations, including invoice processing, client management, and financial reporting. The system aims to streamline operations and provide robust financial insights for businesses in this sector.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Framework**: React 18 with TypeScript.
- **Design System**: Radix UI components with shadcn/ui.
- **Styling**: Tailwind CSS, custom PROFAC brand colors, comprehensive dark theme support.
- **User Experience**: Smooth page transitions with Framer Motion, animated password visibility toggles, user-friendly error messages, consistent modal and toast notification system.
- **Accessibility**: Enhanced theme compatibility for Android devices.

### Technical Implementations
- **Frontend**: TanStack Query for server state, Wouter for routing, Vite for builds.
- **Backend**: Express.js with TypeScript, RESTful API with JSON, session-based authentication, Zod validation.
- **Database**: PostgreSQL with Drizzle ORM, complete DatabaseStorage implementation, full data persistence.
- **Authentication**: Username/password, company-based user accounts, session management, role-based access control (including super admin).
- **Email System**: Configurable SMTP with Nodemailer, email notifications for user actions, contact forms, and version updates.
- **File Management**: Version-controlled software downloads, usage analytics, FTP-based file streaming for secure and reliable downloads.
- **Customer Interaction**: Comment/testimonial system with moderation, contact form integration creating support tickets, FAQ system.
- **Registration**: CNPJ-based registration with automatic company name lookup via API.
- **Admin Features**: User management (editing, role assignment, password reset flags), version history editing, comment moderation, FTP and SMTP configuration management with health checks, comprehensive support ticket system.

### Feature Specifications
- **Core Operations**: Invoice processing, bill management.
- **User Management**: Secure login, account details, admin panel for user oversight.
- **Download Management**: Tracked downloads, version history, secure access based on authentication.
- **Communication**: Automated email notifications, customer feedback collection.
- **Support System**: Integrated support ticket management, comprehensive support page with multiple contact channels.
- **Legal Compliance**: LGPD-compliant cookie banner, dedicated About, Privacy Policy, Terms of Use pages.

## External Dependencies

- **Database**: Neon PostgreSQL (serverless).
- **UI Components**: Radix UI, shadcn/ui.
- **State Management**: TanStack Query.
- **Routing**: Wouter.
- **Forms**: React Hook Form, Hookform Resolvers.
- **Date Handling**: date-fns.
- **Styling**: Tailwind CSS, class-variance-authority, PostCSS, Autoprefixer.
- **Icons**: Lucide React.
- **Validation**: Zod, drizzle-zod.
- **Build Tools**: Vite, esbuild.
- **ORM**: Drizzle ORM, Drizzle Kit.
- **Email Service**: Nodemailer (via SMTP configuration).
- **External APIs**: ReceitaWS (for CNPJ consultation).
- **Replit Integration**: Vite Plugin (runtime error modal), Cartographer (development environment).

## Recent Changes  
- **February 21, 2026 - SITE ANALYTICS + GEOLOCATION**: Comprehensive analytics tracking system with automatic page view recording, SHA-256 IP hashing for LGPD privacy compliance, visitor geolocation (country/state/city via geoip-lite local database), admin dashboard with daily line charts, monthly bar charts, top pages ranking, location table with visitor origins, KPI cards (today's visits, total views, unique visitors, daily average), period selector (7/14/30/60/90 days), 300ms debounce to prevent duplicates. New pageViews table with location columns, useAnalytics hook for automatic route tracking, admin-only API endpoints with aggregation queries. Files: shared/schema.ts, server/storage.ts, server/routes.ts, client/src/hooks/useAnalytics.ts, client/src/pages/admin-analytics.tsx.
- **February 21, 2026 - PERFORMANCE OPTIMIZATION**: Major performance overhaul: Vite manual chunks split main bundle from 753KB to 167KB (78% reduction), added gzip compression middleware, immutable cache headers for hashed assets (1 year), lazy loading extended to all secondary pages (Dashboard, Support, About, Privacy, Terms, Contact, ForgotPassword), modern ES2022 build target, LightningCSS minification, HSTS security header, sameSite cookie attribute, removed unused legacy files. Initial page load reduced significantly.
- **August 4, 2025 - ENHANCED EMAIL VALIDATION**: Implemented comprehensive email validation system with multi-configuration testing, detailed error messages with technical information and troubleshooting steps, automatic fallback configurations (STARTTLS, SSL/TLS), enhanced admin interface with EmailTester component providing visual feedback and formatted results. Email delivery confirmed working with relay.dynu.com configuration.
- **August 2, 2025 - FUTURISTIC IMAGE INVITES**: Added second invite option generating SVG/JPG images in landscape A4 70% format with 3D futuristic design, app interface mockup, and modern gradients. Features high-quality image generation with automatic download, responsive preview, and professional layout optimized for WhatsApp sharing.
- **August 2, 2025 - SMTP OPTIMIZATION**: Optimized email delivery system using configured SMTP server with enhanced settings for maximum compatibility. Implemented proper SSL/STARTTLS detection, extended timeouts, relaxed TLS validation, and comprehensive error logging. Uses configured server settings with optimized headers and authentication for reliable email delivery to Gmail and other providers.
- **August 2, 2025 - RESPONSIVE PDF GENERATION**: Implemented dynamic responsive PDF generation system for WhatsApp sharing. Features automatic device detection (mobile/tablet/desktop), adaptive sizing (90vh/80vh/75vh), responsive typography scaling, optimized spacing and padding, mobile-first design approach, print-optimized layouts, and cross-device compatibility. PDF automatically adjusts font sizes, margins, and layout based on screen dimensions for optimal viewing across all devices.
- **August 2, 2025 - EMAIL INVITATION SYSTEM**: Implemented complete Email Invitation system with database tracking (email_invitations table), conversion analytics, and comprehensive admin panel. Features include invitation sending with professional HTML emails, click tracking, conversion monitoring, expiration handling, and detailed statistics dashboard. Super admin can send invites with custom messages, track performance metrics (click rates, conversion rates), and view invitation history. Invitation emails include branded templates and direct links for seamless user onboarding.
- **August 2, 2025 - LOGIN PERSISTENCE + ADMIN EMAIL TOOLS**: Enhanced login form with "Remember credentials" checkbox for cross-device access, fixed Nodemailer bug (createTransporter → createTransport), added manual welcome email button for administrators, implemented company filter dropdown in admin users panel, improved SMTP debugging with detailed logs. Login now persists email and password across different devices (notebook/mobile) when user opts in.
- **August 1, 2025 - WELCOME EMAIL + CNPJ SHARING**: Implemented automatic welcome email system for approved users with professional HTML template, allowed multiple users per CNPJ (same company, different emails), login form remembers credentials, multiple CNPJ APIs with fallback (BrasilAPI, ReceitaWS, CNPJ-WS), removed "Ações Rápidas" section for cleaner dashboard, robust email notifications with detailed logs.
- **August 1, 2025 - FINAL DEPLOY CHECKPOINT (CRITICAL RESTORE POINT)**: Complete migration to DatabaseStorage with PostgreSQL persistence: removed all MemStorage and LocalStorage dependencies, synchronized database schemas, fixed password reset and change functionality, improved change password modal UX (no current password required for resets), enhanced password strength indicators that remain visible during typing, resolved FTP configuration retrieval issues, system fully operational with reliable data persistence. All features validated and working correctly. Ready for production deployment.
- **August 1, 2025 - WELCOME EMAILS + MULTI-USER CNPJ FINAL**: Fixed admin access issue (corrected user role from 'user' to 'admin'), successfully implemented automatic welcome emails sent when users are approved, confirmed multiple users can share same CNPJ with unique emails, CNPJ validation working with multiple API fallbacks, admin panel fully accessible, email notifications with professional HTML templates working perfectly. System completely functional and tested.