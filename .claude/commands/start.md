# Start the application

## Variables

PORT: Default to 5173 (Vite dev server default)

## Workflow

1. Navigate to the app directory:
   - cd "C:\Users\igor\OneDrive\Documents\TAC - Split Lease\app"

2. Check if a process is already running on port 5173.

3. If it is running, just open it in the browser with `start http://localhost:5173`.

4. If there is no process running on port 5173, run these commands:
   - Run `npm run dev` in the background (Vite development server)
   - Note: Vite will automatically use port 5174, 5175, etc. if 5173 is occupied
   - Run `sleep 3` to allow server to start
   - Run `start http://localhost:5173` (or the port Vite chose)

5. Let the user know that the application is running on port 5173 (Vite dev server with HMR) and the browser is open.

## Notes

- This starts the Vite development server with Hot Module Replacement (HMR)
- All 8 HTML entry points are available (index.html, search.html, view-split-lease.html, etc.)
- No build step required - Vite handles compilation on-the-fly