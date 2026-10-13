const { _electron: electron } = require('playwright');

(async () => {
  // Launch Electron app.
  const electronApp = await electron.launch({ cwd: './ai-ide', args: ['.'] });

  // Get the first window that the app opens.
  const window = await electronApp.firstWindow();

  // Wait for it to fully load
  await window.waitForLoadState('networkidle');

  // Save screenshot
  await window.screenshot({ path: 'screenshot.png' });

  // Close app
  await electronApp.close();
})();
