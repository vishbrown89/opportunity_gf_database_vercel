# Admin Dashboard Guide

## Accessing the Admin Panel

### Login Page: `/admin/login`
- Clean login interface with Growth Forum branding
- Email/password authentication
- Session-based security

**Test Credentials:**
- Email: `admin@growthforum.my`
- Password: `password123`

---

## Admin Dashboard: `/admin`

### Features:
- **Statistics Cards:**
  - Active Opportunities count
  - Previous Opportunities count
  - Opportunities added in last 30 days
  - Total opportunities count

- **Quick Actions:**
  - Add New Opportunity
  - Import from URL (AI-powered)
  - Manage Opportunities

### Navigation Bar:
- Dashboard
- Manage (view all opportunities)
- Add New (manual entry)
- Import (AI extraction)
- Logout

---

## Manage Opportunities: `/admin/opportunities`

### Features:
- **Filters:**
  - Search by title
  - Filter by category
  - Filter by status (Active/Expired/All)

- **Table View:**
  - Title
  - Category
  - Country/Region
  - Deadline
  - Status badge (Active/Expired)
  - Featured flag

- **Actions per row:**
  - Edit button → goes to `/admin/edit/[id]`
  - Delete button → confirms before deleting

---

## Add New Opportunity: `/admin/add`

### Form Fields:
- **Required:**
  - Title
  - Category (dropdown with all 12 categories)
  - Country/Region
  - Deadline (date picker)
  - Summary (textarea)
  - Source URL

- **Optional:**
  - Logo URL (for organization branding)
  - Full Description
  - Eligibility
  - Funding & Benefits
  - Tags (comma-separated)
  - Featured checkbox

### Automatic Features:
- URL slug generated from title
- Status automatically determined from deadline
- Date added timestamp
- Form validation

---

## Edit Opportunity: `/admin/edit/[id]`

- Same form as Add New
- Pre-filled with existing data
- Update button instead of Create

---

## Import from URL: `/admin/import-url`

### AI-Powered Extraction:

**Step 1: Paste URL**
- Input field for opportunity webpage URL
- Extract button

**Step 2: AI Processing**
- Fetches webpage content
- Calls OpenAI GPT-4o-mini
- Extracts structured data:
  - Title
  - Summary
  - Full description
  - Eligibility
  - Funding/Benefits
  - Category (auto-suggested)
  - Country/Region
  - Deadline
  - Tags
  - Logo URL (if detectable)

**Step 3: Review & Edit**
- Shows pre-filled form
- Admin can review and modify
- Save to database

### Requirements:
- `OPENAI_API_KEY` must be set in environment variables
- Valid opportunity URL

---

## Admin Layout Features

### Navigation:
- Growth Forum logo (links to home)
- Dashboard, Manage, Add New, Import tabs
- Shows logged-in admin email
- Logout button

### Security:
- Protected routes - redirects to login if not authenticated
- Session-based authentication using sessionStorage
- Password hashing with bcrypt

---

## Sample Data

The database is pre-populated with 5 sample opportunities:

1. **Global Innovation Fellowship 2025** (Fellowship, Featured)
2. **Southeast Asia Research Grant** (Research Funding, Featured)
3. **Digital Skills Training Program** (Training)
4. **Young Leaders Scholarship 2025** (Scholarship, Featured)
5. **Climate Action Challenge** (Challenge, EXPIRED)

---

## Admin User Management

Currently using simple table-based authentication.

### Database Table: `admin_users`
- `id` (UUID)
- `email` (unique)
- `password_hash` (bcrypt)
- `created_at`

### To add more admins:
Use Supabase SQL Editor:

```sql
-- First, hash your password using bcrypt
-- Then insert:
INSERT INTO admin_users (email, password_hash)
VALUES ('newadmin@growthforum.my', '$2a$10$YourHashedPasswordHere');
```

---

## Status Management

### Automatic Status Determination:
- Opportunities are NOT manually set to Active/Expired
- Status is calculated on-the-fly based on deadline vs current date
- If deadline >= today → Active
- If deadline < today → Expired

### Frontend Display:
- Active opportunities: green badge
- Expired opportunities: red badge
- Deadline within 7 days: orange warning color

---

## Features Summary

✅ Secure admin authentication
✅ Dashboard with statistics
✅ Full CRUD operations
✅ Search and filtering
✅ AI-powered URL import
✅ Automatic status management
✅ Featured opportunity toggle
✅ Responsive admin interface
✅ Logo upload support
✅ Tag management
✅ SEO-friendly slug generation

---

## Access URLs

Once the dev server is running:

- **Public Site:** `/`
- **Opportunities Listing:** `/opportunities`
- **Admin Login:** `/admin/login`
- **Admin Dashboard:** `/admin`
- **Manage Opportunities:** `/admin/opportunities`
- **Add Opportunity:** `/admin/add`
- **Import from URL:** `/admin/import-url`

---

## Tech Stack

- **Framework:** Next.js 13 (App Router)
- **UI Components:** shadcn/ui + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Custom bcrypt-based
- **AI:** OpenAI GPT-4o-mini
- **State:** React hooks + server components
