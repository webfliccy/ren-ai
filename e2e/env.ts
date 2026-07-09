import path from "path";

// Shared between playwright.config.ts (which passes these to the web server)
// and global-setup.ts (which seeds the database) so they can never disagree.
export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;
export const E2E_ADMIN_SECRET = "e2e-admin-secret";
export const E2E_DB_PATH = path.join(__dirname, ".artifacts", "e2e.db");
