# Split Lease TAC (Temporary Accommodations & Co-living)

A modern, high-performance property search and booking application for flexible shared accommodations with weekly scheduling. Built with React Islands Architecture, ESM-only modules, Vite build system, and deployed on Cloudflare Pages. Powered by Supabase PostgreSQL and Google Maps.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Usage Guide](#usage-guide)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Split Lease TAC is a multi-page web application that enables users to find, filter, and book shared accommodations across NYC and New Jersey with flexible weekly scheduling. The platform features advanced filtering, dynamic pricing based on stay duration, interactive maps, and AI-powered market research.

### What Makes It Special

- **ESM-Only Architecture**: Strict ES modules with explicit .js/.jsx extensions—no CommonJS, no build complexity
- **React Islands Pattern**: Selective hydration for interactive components only—fast initial loads
- **Vite Build System**: Lightning-fast development with Hot Module Replacement (HMR)
- **Multi-Page Application**: 8 separate HTML entry points for optimal SEO and page load performance
- **100% Database-Driven Filtering**: All location data loaded dynamically from Supabase—no hardcoded values
- **Intelligent Pricing**: Real-time price calculations based on selected nights (2-7 nights)
- **Cloudflare Pages Deployment**: Global edge network for low latency worldwide
- **TypeScript for Safety**: React components written in TypeScript for type safety

---

## ✨ Key Features

### 🔍 Advanced Filtering System

**6 Filter Groups**:
1. **Borough Filter** - Select from 7 NYC/NJ boroughs (database-driven)
2. **Neighborhood Filter** - Multi-select from 293+ neighborhoods with real-time search
3. **Week Pattern Filter** - Choose rental patterns (every week, alternating weeks, etc.)
4. **Price Tier Filter** - Select price ranges (<$200 to $500+)
5. **Sort Options** - Recommended, price, views, or recent additions
6. **Schedule Selector** - Interactive 7-day picker with 2-5 contiguous day constraint

### 🗺️ Interactive Mapping

- **Google Maps Integration** with custom price markers
- **Property Clustering** for high-density areas
- **Info Windows** with listing previews on marker click
- **Synchronized Updates** - map markers reflect current filters
- **Street/Satellite Views** with zoom controls

### 💰 Dynamic Pricing

- **Real-Time Calculations** based on selected nights
- **Per-Night Rates** for 2, 3, 4, 5, and 7-night stays
- **Instant Updates** when schedule changes
- **Transparent Pricing** - see exactly what you'll pay per night

### 🤖 AI Market Research

- **Deep Research Feature** - Get personalized market insights
- **Smart Extraction** - Automatically parses email/phone from freeform text
- **Auto-Correction** - Fixes common email typos (gmial → gmail)
- **Multi-Step Wizard** - Guided experience with Lottie animations
- **Instant Reports** - AI-generated market research delivered to email

### 📱 Contact & Messaging

- **Direct Host Contact** - Message property owners through modal interface
- **Form Validation** - Email format and required field checks
- **Bubble.io Integration** - Reliable message delivery via workflow API
- **Loading States** - Clear feedback during submission

### ⚡ Performance Features

- **Lazy Loading** - Load 6 listings at a time for instant initial render
- **Batch Photo Fetching** - Single database query for all images
- **Optimized Queries** - Efficient PostgREST filters with proper indexing
- **Script Cache-Busting** - Version parameters ensure latest code
- **Intersection Observer** - Native browser API for scroll detection

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- API keys (see [Detailed Setup](#detailed-setup))

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd "TAC - Split Lease/app"

# 2. Install dependencies
npm install

# 3. Create environment configuration
# Create .env file with your API keys:
cat > .env << 'EOF'
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
VITE_BUBBLE_API_KEY=your_bubble_api_key_here
EOF

# 4. Start Vite development server
npm run dev

# 5. Open in browser
# Navigate to http://localhost:5173
```

**Note**: You'll need to replace the placeholder API keys with actual values. See [Detailed Setup](#detailed-setup) for how to obtain them.

---

## 🛠️ Detailed Setup

### 1. Environment Configuration

Create `.env` file in the `app/` directory (this file is git-ignored):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://qcfifybkaddcoimjroca.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Bubble.io Configuration (optional for contact features)
VITE_BUBBLE_API_KEY=your_bubble_api_key
VITE_BUBBLE_API_BASE_URL=https://app.split.lease/api/1.1
VITE_BUBBLE_MESSAGING_ENDPOINT=https://app.split.lease/api/1.1/wf/core-contact-host-send-message
```

**Important**: All environment variables must be prefixed with `VITE_` to be accessible in client-side code.

### 2. Obtain API Keys

#### Supabase Setup

1. Create account at [supabase.com](https://supabase.com)
2. Create new project or use existing
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`

**Important**: The anon key is safe for frontend use and has Row Level Security (RLS) policies applied.

#### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. **Restrict the key** (recommended):
   - Application restrictions: HTTP referrers
   - Add your domain(s)
   - API restrictions: Select only Maps JavaScript API and Places API

#### Bubble.io Setup (Optional)

**For Read-Only Features**: No setup needed—existing endpoints work out of the box.

**For Contact/Messaging Features**: Contact Split Lease team for API key.

### 3. Database Setup

The application connects to an existing Supabase database. If you need to set up your own:

#### Required Tables

1. **`listing`** - Main property listings (111 columns)
2. **`listing_photo`** - Photo URLs linked to listings
3. **`zat_geo_borough_toplevel`** - Borough lookup table
4. **`zat_geo_hood_mediumlevel`** - Neighborhood lookup table
5. **`zat_features_listingtype`** - Space type lookup (Entire Place, Private Room)
6. **`informationaltexts`** - Dynamic tooltip content

See [TECHNICAL_REFERENCE.md](./TECHNICAL_REFERENCE.md) for complete schema details.

### 4. Install Dependencies

Install all required dependencies:

```bash
cd app
npm install
```

**Core Dependencies**:
- `react@18.2.0` - React library for Islands
- `react-dom@18.2.0` - React DOM renderer
- `@supabase/supabase-js@^2.38.0` - Supabase client
- `framer-motion@12.23.24` - Animation library
- `lucide-react@0.553.0` - Icon library
- `lottie-react@2.4.1` - Lottie animations

**Dev Dependencies**:
- `vite@^5.0.0` - Build tool and dev server
- `@vitejs/plugin-react@^4.2.0` - Vite React plugin

### 5. Development Workflow

Start the Vite development server:

```bash
npm run dev
```

This will:
- Start dev server on port 5173
- Enable Hot Module Replacement (HMR)
- Compile React Islands on-the-fly
- Make all 8 HTML entry points available

### 6. Production Deployment

#### Option A: Cloudflare Pages (Recommended)

1. Connect GitHub repository to Cloudflare Pages
2. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `app`
3. Environment variables:
   - Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc. in Cloudflare dashboard
4. Deploy triggers automatically on git push

#### Option B: Static Hosting (Netlify, Vercel)

```bash
# Build production assets
npm run build

# Deploy dist/ folder to your hosting provider
```

Build configuration:
- Build command: `npm run build`
- Publish directory: `app/dist`
- Node version: 18+

#### Option C: Traditional Web Server (Apache, Nginx)

1. Build the application: `npm run build`
2. Copy `dist/` folder contents to web root
3. Configure HTTPS (required for geolocation and some APIs)
4. Set cache headers for static assets
5. Add rewrite rules for Cloudflare Functions routes

#### Environment-Specific Configuration

Vite automatically loads environment variables from `.env` files:
- `.env` - All environments
- `.env.local` - Local overrides (gitignored)
- `.env.production` - Production only
- `.env.development` - Development only

---

## 📖 Usage Guide

### For End Users

#### Searching for Properties

1. **Open the application** in your web browser
2. **Use filters** to narrow results:
   - Select a **borough** from dropdown
   - Choose **neighborhoods** (multi-select with search)
   - Pick your **rental pattern** (weekly, bi-weekly, etc.)
   - Set **price range**
   - Choose **sort order**
3. **Select your schedule**:
   - Click days in the schedule selector
   - Must select 2-5 contiguous days
   - Prices update automatically
4. **Browse listings**:
   - Scroll to see more (6 at a time load automatically)
   - Click photos to view carousel
   - Check map for locations
5. **Contact hosts**:
   - Click **"Contact Host"** on any listing
   - Fill in your details and message
   - Submit to send inquiry

#### Using the Map

- **View Mode Toggle**: Switch between Street and Satellite views
- **Marker Click**: Click price markers to see listing preview
- **Zoom/Pan**: Use mouse or touch gestures to navigate
- **Legend**: Blue = available, Purple = selected listing

#### AI Market Research

1. Click the **purple atom icon** (floating button, bottom-right)
2. Describe your housing needs in freeform text
3. Include your email/phone (or enter separately)
4. Confirm contact details
5. Receive AI-generated market report via email within 24 hours

### For Developers

#### Project Structure

```
app/
├── public/                    # Static HTML entry points
│   ├── index.html             # Homepage
│   ├── search.html            # Property search page
│   ├── view-split-lease.html  # Listing detail page
│   ├── faq.html               # FAQ page
│   ├── policies.html          # Policies page
│   ├── list-with-us.html      # Host onboarding
│   ├── success-stories.html   # Testimonials
│   ├── why-split-lease.html   # Value proposition
│   ├── assets/                # Images, fonts, lotties
│   └── _redirects             # Cloudflare routing rules
├── src/                       # React source code
│   ├── islands/               # React Islands components
│   │   ├── pages/             # Page-level components
│   │   │   ├── HomePage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   └── ViewSplitLeasePage.jsx
│   │   └── shared/            # Reusable components
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       ├── DaySelector.jsx
│   │       └── GoogleMap.jsx
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.js        # Supabase client
│   │   ├── constants.js       # App constants
│   │   ├── dataLookups.js     # Location lookups
│   │   └── urlParams.js       # URL state management
│   └── styles/                # CSS stylesheets
│       └── main.css
├── functions/                 # Cloudflare Functions
│   └── view-split-lease/[id].js
├── dist/                      # Vite build output (gitignored)
├── vite.config.js             # Vite configuration
├── package.json               # "type": "module"
└── .env                       # Environment variables (gitignored)
```

#### Key Files & Line Numbers

- **`src/islands/pages/SearchPage.jsx`** - Main search page component with filtering logic
- **`src/islands/shared/DaySelector.jsx`** - Interactive 7-day schedule picker
- **`src/lib/supabase.js`** - Supabase client initialization
- **`src/lib/constants.js`** - Application constants (138+ lines)
- **`src/lib/dataLookups.js`** - Borough/neighborhood lookup utilities
- **`src/lib/urlParams.js`** - URL state synchronization
- **`vite.config.js`** - Vite build configuration with multi-page setup

#### Adding New Features

**Add a New Filter**:

1. Update `SearchPage.jsx` to include new filter state
2. Add UI element in `search.html` and wire up React Island
3. Update Supabase query logic in `SearchPage.jsx`
4. Add filter to URL params in `urlParams.js` for sharing

**Add a New Listing Field**:

1. Ensure field exists in Supabase `listing` table
2. Update `SearchPage.jsx` to fetch and display the field
3. Add to listing card component rendering
4. Add CSS styling in `src/styles/`

**Modify React Island Components**:

1. Edit the component in `src/islands/shared/` or `src/islands/pages/`
2. Vite automatically rebuilds with HMR (no manual build needed)
3. Test changes immediately in browser

#### Development Workflow

```bash
# 1. Start Vite development server (with HMR)
npm run dev

# 2. Make changes to any files:
#    - React Island components (.jsx) - instant HMR
#    - Utility libraries (.js) - instant HMR
#    - CSS files - instant HMR
#    - HTML files - browser refresh

# 3. Changes appear automatically in browser (no manual refresh needed)

# 4. Build for production when ready
npm run build

# 5. Test production build locally
npm run preview
```

**No separate build step needed** - Vite handles everything!

#### Testing

```bash
# Run Playwright tests
npm test

# Run specific test file
npx playwright test tests/filters.spec.js

# Run in headed mode (see browser)
npx playwright test --headed
```

---

## 🏗️ Architecture

### ESM-Only Monolithic with React Islands Architecture

**Core Philosophy**: Strict ES modules everywhere, React Islands for selective interactivity, Vite for blazing-fast development and optimized production builds, Cloudflare Pages for global edge deployment.

```
┌─────────────────────────────────────────┐
│         Browser (Client-Side)           │
├─────────────────────────────────────────┤
│  8 HTML Entry Points                    │
│  ├── index.html (Homepage)              │
│  ├── search.html (Search Page)          │
│  ├── view-split-lease.html (Details)    │
│  └── ... (5 more pages)                 │
├─────────────────────────────────────────┤
│  React Islands (Selective Hydration)    │
│  ├── SearchPage.jsx (Search logic)      │
│  ├── DaySelector.jsx (Schedule picker)  │
│  ├── Header.jsx (Navigation)            │
│  └── GoogleMap.jsx (Interactive map)    │
├─────────────────────────────────────────┤
│  ESM Utility Libraries                  │
│  ├── supabase.js (DB client)            │
│  ├── dataLookups.js (Location cache)    │
│  └── urlParams.js (URL state sync)      │
├─────────────────────────────────────────┤
│  API Layer                              │
│  ├── Supabase Client (PostgreSQL)       │
│  └── Bubble.io API (Workflows)          │
└─────────────────────────────────────────┘
         ↓                    ↓
┌──────────────────┐  ┌─────────────────┐
│    Supabase      │  │   Bubble.io     │
│   (PostgreSQL)   │  │   Workflows     │
│  - Listings      │  │  - Messaging    │
│  - Photos        │  │  - AI Research  │
│  - Locations     │  │  - Auth         │
└──────────────────┘  └─────────────────┘
         ↑
┌─────────────────────────────────────────┐
│       Cloudflare Pages (Edge)           │
│  ├── Global CDN                         │
│  ├── Static HTML/CSS/JS                 │
│  └── Cloudflare Functions (Dynamic)     │
│      └── /view-split-lease/[id]         │
└─────────────────────────────────────────┘
```

### Data Flow Architecture

**Filter Application Flow**:
```
User Changes Filter in SearchPage.jsx
    ↓
React State Update (useState hook)
    ↓
useEffect Triggers Re-fetch
    ↓
Supabase Query with Filters
    ↓
Transform Database Results
    ↓
React Re-renders Listing Cards
    ↓
Update Map Markers (GoogleMap.jsx)
    ↓
Update URL Params (urlParams.js)
    ↓
User Sees Updated Results (Instant)
```

**Dynamic Pricing Flow**:
```
User Selects Days in DaySelector.jsx
    ↓
React onChange Callback
    ↓
Parent Component State Update (SearchPage.jsx)
    ↓
Price Calculation for Each Listing
    ↓
React Re-renders with New Prices
    ↓
Map Markers Update with New Prices
    ↓
URL Params Update for Sharing
    ↓
User Sees Updated Prices (< 200ms)
```

**Islands Hydration Flow**:
```
Browser Loads Static HTML
    ↓
Vite Injects React Island Scripts
    ↓
React createRoot() for Each Island
    ↓
Island Hydrates with Interactivity
    ↓
User Can Interact with Island
    ↓
Non-Island Content Remains Static (Fast)
```

### State Management

**React Island State** (Component-Local):
- React components use hooks (`useState`, `useEffect`, `useMemo`)
- Each island manages its own state independently
- State lifting for parent-child communication
- URL params for shareable state (filters, days selected)

**Shared State Patterns**:
- URL parameters for filters (via `urlParams.js`)
- Supabase client singleton (imported from `lib/supabase.js`)
- Data lookups cached in memory (via `dataLookups.js`)
- Environment variables via `import.meta.env.VITE_*`

**No Global Window State** - All state is in React or URL params

---

## 💻 Technologies

### Frontend Stack

- **React 18.2.0** - Islands Architecture for selective interactivity
- **Vite 5.0.0** - Next-generation build tool with HMR
- **ES Modules** - Strict ESM-only (type: "module")
- **Framer Motion 12.23.24** - Production-ready animations
- **Lucide React 0.553.0** - Icon library (600+ icons)
- **Lottie React 2.4.1** - JSON-based animations
- **HTML5** - Semantic markup, 8 entry points
- **CSS3** - Custom properties, Flexbox, Grid

### Backend & Database

- **Supabase** - PostgreSQL database with real-time capabilities
  - PostgREST API for fast queries
  - Row Level Security (RLS) policies
  - Foreign key relationships with data integrity
- **Bubble.io** - No-code backend for workflows
  - Message delivery
  - AI processing coordination
  - User authentication (future)

### External Services

- **Google Maps Platform**
  - Maps JavaScript API
  - Places API
  - Custom markers and info windows
- **Lottie** - JSON-based animations
- **CDN Resources** - React, Supabase client, fonts

### Build & Development

- **Vite 5.0.0** - Dev server + production bundler
- **@vitejs/plugin-react 4.2.0** - React Fast Refresh
- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager
- **Playwright** (Future) - End-to-end testing
- **Git** - Version control

---

## 🐛 Troubleshooting

### Common Issues

#### Port 5173 Already in Use

**Symptoms**: `npm run dev` fails with port already in use error.

**Solution**:
```bash
# Vite will automatically try 5174, 5175, etc.
# Or manually kill the process:
npx kill-port 5173

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### No Listings Displayed

**Symptoms**: Search page loads but no listings appear.

**Cause**: Supabase connection issue or RLS policies blocking data.

**Solution**:
1. Check browser console for Supabase errors
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
3. Test Supabase connection:
   ```javascript
   import { supabase } from './src/lib/supabase.js';
   const { data, error } = await supabase.from('listing').select('*').limit(1);
   console.log(data, error);
   ```
4. Check RLS policies in Supabase dashboard

**Verification**: Check browser console network tab for Supabase API calls.

#### Map Not Loading

**Symptoms**: Map section shows placeholder or error.

**Causes**:
1. Invalid Google Maps API key
2. API not enabled in Google Cloud Console
3. Domain restriction preventing access
4. React Island not hydrating

**Solutions**:
1. Verify `VITE_GOOGLE_MAPS_API_KEY` in `.env`
2. Enable both **Maps JavaScript API** and **Places API**
3. Add `localhost:5173` to allowed referrers (or remove restrictions for testing)
4. Check browser console for specific Google Maps errors
5. Verify GoogleMap.jsx component is rendering (React DevTools)

#### Prices Not Updating

**Symptoms**: Changing schedule selector doesn't update listing prices.

**Causes**:
1. React Island not hydrating
2. State not propagating from DaySelector to SearchPage
3. Missing price fields in database

**Solutions**:
1. Check console for React errors during initialization
2. Verify DaySelector.jsx component is rendering
3. Check SearchPage.jsx receives day selection updates
4. Verify database has `💰Nightly Host Rate for X nights` fields
5. Use React DevTools to inspect component state

#### Filters Not Working

**Symptoms**: Selecting filters doesn't change results.

**Causes**:
1. React Island not hydrating
2. Supabase query building incorrectly
3. Incorrect filter IDs
4. Data lookups not initializing

**Solutions**:
1. Check browser console for React errors
2. Verify SearchPage.jsx is rendering
3. Inspect Supabase queries in Network tab
4. Verify borough/neighborhood IDs match database values
5. Check dataLookups.js initialization

### Debugging Tips

#### Check Vite Dev Server

```bash
# Terminal output shows:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose

# Verify server is running and port is correct
```

#### Check Environment Variables

```javascript
// Browser console
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

// All should return values, not undefined
```

#### Check Supabase Connection

```javascript
// Browser console (after page load)
import { supabase } from './src/lib/supabase.js';

// Test query
const { data, error } = await supabase.from('listing').select('*').limit(1);
console.log(data, error);
```

#### Inspect React Component State

- Install React DevTools extension
- Select component in DevTools
- Inspect state, props, and hooks
- Check for re-render loops or stale state

#### Build Failures

**Symptoms**: `npm run build` fails with errors.

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
npm install
npm run build

# On Windows:
rmdir /s /q node_modules dist .vite
npm install
npm run build
```

#### HMR Not Working

**Symptoms**: Changes don't appear without manual refresh.

**Solutions**:
1. Check browser console for websocket errors
2. Ensure no firewall blocking port 5173
3. Try `npm run dev -- --host` for network access
4. Clear browser cache
5. Restart Vite dev server

### Browser Compatibility

**Supported**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari iOS 14+
- Chrome Mobile Android 90+

**Requirements**:
- ES Modules support (native)
- ES2020+ features
- CSS Custom Properties
- Intersection Observer API

**Known Issues**:
- Internet Explorer: Not supported (uses ES Modules)
- Old Safari (<14): May need polyfills for some features

---

## 🤝 Contributing

### Development Guidelines

1. **Code Style**:
   - Use ES6+ features
   - Prefer `const` over `let`, avoid `var`
   - Use template literals for strings
   - Add JSDoc comments for functions
   - Follow existing naming conventions

2. **Git Workflow**:
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name

   # Make changes and commit
   git add .
   git commit -m "feat: Add new feature description"

   # Push and create PR
   git push origin feature/your-feature-name
   ```

3. **Commit Messages**:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `perf:` - Performance improvements
   - `test:` - Test additions/changes
   - `chore:` - Build process, dependencies

### Project Priorities

**Current Focus**:
1. Complete all 8 page implementations (search, detail, FAQ, policies, etc.)
2. Implement comprehensive test coverage (Vitest + Playwright)
3. Optimize React Islands hydration performance
4. Improve error handling and user feedback
5. Add loading states for better UX

**Future Roadmap**:
1. Add listing title/description search
2. Implement user accounts and saved searches (Supabase Auth)
3. Add favorites/bookmarking with localStorage or Supabase
4. Build host dashboard (new page set)
5. Integrate payment processing (Stripe)
6. Add review/rating system
7. Implement real-time availability updates (Supabase Realtime)

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details.

---

## 📞 Contact

**Split Lease**
- Website: [app.split.lease](https://app.split.lease)

---

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- Maps powered by [Google Maps Platform](https://cloud.google.com/maps-platform)
- Workflows powered by [Bubble.io](https://bubble.io)
- Animations from [Lottie](https://airbnb.design/lottie/)

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Active Development
**Architecture**: ESM-only Monolithic + React Islands + Vite + Cloudflare Pages
