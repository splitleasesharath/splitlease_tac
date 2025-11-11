# Health Check

Verify the Split Lease TAC application is healthy and accessible.

## Instructions

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Check if Vite dev server is running:
   ```bash
   curl -f http://localhost:5173 || echo "Server not running"
   ```

3. If server is not running, report status and recommend starting with `npm run dev`

4. If server is running:
   - Verify homepage loads: `curl -f http://localhost:5173/`
   - Verify search page loads: `curl -f http://localhost:5173/search.html`
   - Check for any HTTP errors (4xx, 5xx)

5. Report the health status:
   - ✅ Healthy: Server responding on port 5173, all pages accessible
   - ⚠️ Warning: Server running but some pages fail
   - ❌ Unhealthy: Server not running or not responding

## Notes

This replaces the Python health check script. The Vite dev server health is verified by simple HTTP requests.