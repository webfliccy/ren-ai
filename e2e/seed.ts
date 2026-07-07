import globalSetup from "./global-setup";

// Playwright starts the webServer command before globalSetup runs, and
// `next build` executes route handlers that query the database — so the
// webServer command runs this first. globalSetup stays registered to reset
// data when reuseExistingServer skips the command entirely.
globalSetup().catch((err) => {
  console.error(err);
  process.exit(1);
});
