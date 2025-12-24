# 6ixgo Internal Admin - Copilot Instructions

This document serves as the master guide for generating code for the "6ixgo Internal" project. Please follow these instructions strictly, prioritizing maintainability, scalability, and specific business logic as defined below.

## 1. Project Overview & Architecture
* **Application Name:** 6ixgo Internal.
* **Type:** Admin Dashboard / Internal Tool.
* **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Ant Design 6, React Query, Axios.
* **Styling:** Ant Design components with Tailwind CSS utilities.
* **Environment Strategy:**
    * Support two distinct environments: **Staging (STG)** and **Production (PRD)**.
    * API Base URLs differ per environment and per service (see API Section).
    * Environment can be switched via UI toggle (stored in localStorage).

## 2. Project Structure
```
app/
├── components/          # Reusable UI components
│   ├── FilterSidebar/   # Product search filters
│   ├── ProductTable/    # Main product data grid
│   ├── VariantRow/      # Nested variant display
│   ├── NoteEditor/      # CS notes CRUD
│   ├── PaginationBar/   # Full pagination controls
│   └── Layout/          # AppHeader, ProtectedRoute
├── config/              # Environment configuration
├── constants/           # Filter options, defaults
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Auth context & login/logout
│   ├── useResources.ts  # Resource caching with React Query
│   ├── useProducts.ts   # Product search & mutations
│   └── useDebounce.ts   # Debounce utilities
├── services/            # API service layer
│   ├── api.ts           # Axios instances with interceptors
│   ├── authService.ts   # Login/logout APIs
│   ├── resourceService.ts # GET resources with localStorage cache
│   └── productService.ts  # Product search & note updates
├── types/               # TypeScript interfaces
├── login/page.tsx       # Login page
├── page.tsx             # Main CS Product Search page
├── layout.tsx           # Root layout with providers
└── providers.tsx        # React Query + Ant Design + Auth providers
```

## 2. Authentication & Security
* **Mechanism:** Cookie-based authentication handled entirely by the backend.
* **Access Control:**
    * The entire application is private. Login is required to access any route.
    * **Interceptor Logic:** Global Axios interceptor in `app/services/api.ts`.
        * **401 Unauthorized:** Redirect to login page immediately.
        * **403 Forbidden:** Log permission denied error.
    * **ProtectedRoute:** Component in `app/components/Layout/ProtectedRoute.tsx` wraps protected pages.

## 3. Module: Customer Support (CS) Product Search
This is the priority module. Its goal is to help CS members quickly find products and variants to advise customers and manage internal notes.

### 3.1. Data Handling & Resource Caching
* **Resource API:** The app relies heavily on a `GET resources` API (Categories, Locations, Languages, etc.).
* **Caching Strategy:** 
    - React Query with 24-hour staleTime in `useResources` hook.
    - LocalStorage persistence in `resourceService.ts` with 24-hour TTL.

### 3.2. Filter Requirements (Complex Logic)
The search screen has a sidebar (`FilterSidebar` component) with the following filters:

* **Logic:**
    * Conditions *between* different fields are **AND**.
    * Conditions *within* a list (multi-select) are **OR**.
* **Filter Fields:**
    1.  **Main Category:** `mainCategoryCode` (Required, Single Select) - Triggers search immediately.
    2.  **Sub Categories:** `categoryCodes` (Optional, Multi Select) - Requires Apply button.
    3.  **Languages:** `langCodes` (Optional, Multi Select).
    4.  **Locations:** `locationCodes` (Optional, Multi Select).
    5.  **Progress Method:** `progressMethodCodes` - Dependent on Main Category.
    6.  **Product Type:** `productTypeCodes` - Dependent on Main Category.
    7.  **Number of Sessions:** `numberOfProgresses` - Hardcoded in `constants/filters.ts`.
    8.  **Sessions Per Week:** `numberOfProgressPerWeeks` - Hardcoded in `constants/filters.ts`.
    9.  **Search:** `searchTerm` - 500ms debounce via `useDebounce` hook.

* **UI/UX for Filters:**
    * Multi-select dropdowns have "Apply" and "Clear" buttons inside dropdown.
    * "Clear All" button resets all filters except main category.

### 3.3. Results Display (Grid/List)
* **ProductTable Component:** Ant Design Table with expandable rows.
* **Columns:** Image, Product Info (names in 3 languages), Type & Price, Status, Seller, Variants & Notes count, Updated dates.
* **Variant Handling:** Expandable row shows `VariantRow` component with nested table.
* **Global Controls:** "Expand All" / "Collapse All" buttons.

### 3.4. Internal Notes Feature
* **NoteEditor Component:** Handles both product and variant level notes.
* **Fields:** `csImportantNote` (red highlight) and `csSpecialPoint` (blue highlight).
* **Actions:**
    * **Save:** Popconfirm before saving.
    * **Delete:** Popconfirm with danger styling.

## 4. API Specifications

### 4.1. Common Headers (set in `app/services/api.ts`)
* `X-Locale-Code`: "ENG" (from `constants/filters.ts`)
* `X-TimeZone-Offset`: Dynamic via `getTimezoneOffset()`
* `Origin`: **Environment-specific mapping** (set in `config/env.ts`):
    * **STG:** `https://staging-admin.6ixgo.com`
    * **PRD:** `https://admin.6ixgo.com`
* `withCredentials: true` for cookie auth

### 4.2. Endpoints (configured in `app/config/env.ts`)
| Service | STG | PRD |
|---------|-----|-----|
| Resources | staging-api.6ixgo.com | b2c.api.6ixgo.com |
| Admin | staging-admin-api.6ixgo.com | admin-api.6ixgo.com |
| Identity | staging-identity.6ixgo.com | identity.6ixgo.com |
| Origin | staging-admin.6ixgo.com | admin.6ixgo.com |

## 5. Development Commands
```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build with static export
npm run lint     # Run ESLint
```

## 6. GitHub Pages Deployment
* Configured in `next.config.ts` for static export with basePath `/6ixgo-cs`.
* GitHub Actions workflow in `.github/workflows/deploy.yml`.
* Push to `main` or `master` triggers automatic deployment.

## 7. Coding Standards
* **Type Safety:** All API types in `app/types/` directory.
* **Component Pattern:** Each component in its own folder with `index.ts` export.
* **State Management:** React Query for server state, React Context for auth.
* **Error Handling:** Ant Design `message` for user feedback, try-catch in services.