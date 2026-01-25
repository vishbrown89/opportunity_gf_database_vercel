# Growth Forum Opportunities Directory

A production-grade web application for curating and managing grants, scholarships, fellowships, jobs, and programmes.

## Features

- **Public Directory**: Browse active and previous opportunities with advanced filtering
- **SEO Optimized**: Human-friendly URLs, meta tags, and Open Graph support
- **Admin Panel**: Secure authentication and full CRUD operations
- **AI Import**: Extract opportunity details from URLs using OpenAI
- **Responsive Design**: Premium, consultancy-grade UI across all devices
- **Status Automation**: Opportunities automatically expire based on deadlines

## Tech Stack

- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-4o-mini for data extraction

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account and project
- OpenAI API key (for AI import feature)

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Building for Production

```bash
npm run build
npm run start
```

## Database Setup

The database migration has already been applied with:

- `opportunities` table with all required fields
- `admin_users` table for authentication
- Row Level Security policies
- Indexes for performance

### Creating an Admin User

Use Supabase SQL Editor to create your first admin:

```sql
INSERT INTO admin_users (email, password_hash)
VALUES ('admin@growthforum.my', '$2a$10$YourHashedPasswordHere');
```

Generate a hashed password using bcryptjs:

```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your-password', 10));
```

## Project Structure

```
/app
  /admin              # Admin panel pages
  /api                # API routes (AI extraction)
  /opportunities      # Public opportunity listing
  /opportunity/[slug] # Opportunity detail pages
  page.tsx           # Home page
/components           # Reusable UI components
/lib                  # Utilities and database client
```

## Key Routes

### Public
- `/` - Home page with featured and latest opportunities
- `/opportunities` - Full listing with filters and search
- `/opportunity/[slug]` - Detailed opportunity page

### Admin (Protected)
- `/admin/login` - Admin authentication
- `/admin` - Dashboard with statistics
- `/admin/opportunities` - Manage all opportunities
- `/admin/add` - Create new opportunity manually
- `/admin/edit/[id]` - Edit existing opportunity
- `/admin/import-url` - AI-powered URL import

## Features in Detail

### Opportunity Status
Opportunities automatically transition between Active and Expired based on their deadline date. No manual status updates required.

### Featured Opportunities
Mark opportunities as "featured" to display them prominently on the home page.

### AI Import
Paste any opportunity URL and the system will:
1. Fetch the webpage content
2. Extract key information using GPT-4o-mini
3. Pre-fill the opportunity form
4. Allow manual review before saving

### SEO
- Dynamic meta titles and descriptions
- Open Graph tags for social sharing
- Clean, SEO-friendly URL slugs
- Server-side rendering for search engines

## Deployment

This application is ready to deploy to platforms like:
- Vercel
- Netlify
- Custom VPS

Remember to set environment variables in your deployment platform.

## Custom Domain

To use a custom domain like `opportunities.growthforum.my`:
1. Configure your DNS to point to your hosting provider
2. Add the custom domain in your hosting platform settings
3. SSL certificates are usually provided automatically

## Support

For issues or questions, contact the Growth Forum team.

## License

Proprietary - Growth Forum © 2025
