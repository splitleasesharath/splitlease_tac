# Prepare Application

Setup the Split Lease TAC application for review or testing.

## Variables

PORT: Default to 5173 (Vite dev server default)

## Setup

1. Navigate to the app directory:
   ```bash
   cd "C:\Users\igor\OneDrive\Documents\TAC - Split Lease\app"
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Verify environment setup:
   - Check that `package.json` has `"type": "module"`
   - Verify `vite.config.js` exists
   - Ensure `src/islands/` directory structure exists
   - Confirm `.env` or environment variables are configured for Supabase

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Vite will start on port 5173 (or next available port)
   - Hot Module Replacement (HMR) is automatically enabled
   - All 8 HTML entry points are accessible

5. Verify the application is running:
   - The application should be accessible at http://localhost:5173
   - Entry points available:
     - http://localhost:5173/ (homepage)
     - http://localhost:5173/search.html
     - http://localhost:5173/view-split-lease.html
     - http://localhost:5173/faq.html
     - http://localhost:5173/policies.html
     - http://localhost:5173/list-with-us.html
     - http://localhost:5173/success-stories.html
     - http://localhost:5173/why-split-lease.html

   If port 5173 is not available, Vite will automatically use the next available port (5174, 5175, etc.)

## Notes

- No database reset needed - Supabase is external and managed independently
- No separate build step required for development - Vite handles compilation on-the-fly
- To stop the server, use Ctrl+C in the terminal running `npm run dev`
- For production builds, use `npm run build` which outputs to `dist/`
- Read `README.md` for detailed architecture information and setup instructions

