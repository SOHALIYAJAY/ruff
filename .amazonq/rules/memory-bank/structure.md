# Project Structure

## Directory Layout

```
Complaint-Civic-Issue-Reporting-System/
├── .amazonq/rules/memory-bank/       # Memory Bank documentation
├── Complaint-Civic-Issue-Reporting-System-main/
│   ├── Backend/
│   │   └── Civic/                    # Django project root
│   │       ├── Civic/                # Main Django app (settings, urls, core views)
│   │       ├── accounts/             # User auth, registration, profiles
│   │       ├── Categories/           # Complaint category model & serializers
│   │       ├── complaints/           # Complaint model, views, serializers
│   │       ├── contact_us/           # Contact form app
│   │       ├── dashboard/            # Dashboard-specific views
│   │       ├── departments/          # Department & Officer models/views
│   │       ├── media/                # Uploaded complaint images/videos
│   │       ├── scripts/              # Utility scripts
│   │       └── manage.py
│   ├── Frontend/                     # Next.js 15 application
│   │   ├── app/                      # Next.js App Router pages
│   │   │   ├── admin/                # Admin panel pages
│   │   │   ├── department/           # Department user pages
│   │   │   ├── dashboard/            # Civic user dashboard
│   │   │   ├── raise-complaint/      # Complaint submission
│   │   │   ├── track-complaint/      # Complaint tracking
│   │   │   ├── my-complaints/        # User's complaint list
│   │   │   ├── login/ signup/        # Auth pages
│   │   │   ├── profile/              # User profile
│   │   │   ├── notifications/        # Notifications
│   │   │   ├── api/                  # Next.js API routes
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── page.tsx              # Homepage
│   │   ├── components/               # Reusable React components
│   │   │   ├── ui/                   # shadcn/ui primitives
│   │   │   ├── admin/                # Admin-specific components
│   │   │   ├── department/           # Department-specific components
│   │   │   ├── dashboard/            # Dashboard widgets
│   │   │   ├── auth/                 # Login/signup forms
│   │   │   ├── complaint-map.tsx     # Leaflet map component
│   │   │   ├── raise-complaint-form.tsx
│   │   │   ├── header.tsx / footer.tsx
│   │   │   └── ...landing page sections
│   │   ├── contexts/
│   │   │   └── ComplaintsContext.tsx # Global complaints state
│   │   ├── hooks/
│   │   │   ├── use-toast.ts          # Toast notification hook
│   │   │   └── use-mobile.tsx        # Responsive breakpoint hook
│   │   ├── lib/
│   │   │   ├── api.ts                # API call functions
│   │   │   ├── axios.ts              # Axios instance with interceptors
│   │   │   ├── utils.ts              # cn() utility (clsx + tailwind-merge)
│   │   │   ├── card-colors.ts        # Status color mappings
│   │   │   └── districts-talukas.ts  # Gujarat geography data
│   │   ├── services/
│   │   │   └── dashboardService.ts   # Dashboard API service layer
│   │   └── styles/globals.css
│   └── [debug/fix scripts]           # Root-level Django debug scripts
└── package.json                      # Root workspace package.json
```

## Core Components & Relationships

### Backend (Django REST Framework)
- `Civic/` app: Central hub — all URL routing in `urls.py`, core views in `views.py`
- `accounts/` app: CustomUser model (email-based auth), JWT login/register/Google OAuth
- `complaints/` app: Complaint & ComplaintAssignment models, CRUD views
- `departments/` app: Department & Officer models, department profile views
- `Categories/` app: Category model linked to departments

### Data Model Relationships
```
CustomUser (accounts)
    └── Complaint (complaints) [FK: user]
            └── Category (Categories) [FK]
            └── Officer (departments) [FK: officer_id]
                    └── Department (departments)
ComplaintAssignment: Complaint ↔ Officer (M2M with metadata)
```

### Frontend (Next.js App Router)
- Pages in `app/` use server/client components; client components marked with `"use client"`
- `lib/axios.ts` centralizes HTTP client with JWT token injection
- `lib/api.ts` exports typed API functions consumed by page components
- `contexts/ComplaintsContext.tsx` provides global complaint state
- `components/ui/` contains shadcn/ui primitives used throughout

## Architectural Patterns
- **Separation of concerns**: Backend is pure REST API; Frontend is a standalone Next.js SPA
- **Role-based access**: Three roles (Civic-User, Department-User, Admin-User) gate API endpoints via `permission_classes` and frontend route guards
- **Class-based views (CBV)**: Django views use `APIView`, `ListAPIView`, `CreateAPIView` from DRF
- **JWT auth flow**: Login returns `access_token` + `refresh_token`; axios interceptor attaches Bearer token
- **Consistent API response shape**: `{ success: bool, data: ..., error: str, message: str }`
